package org.cvut.navi.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import org.apache.commons.io.IOUtils;
import org.cvut.navi.model.Corner;
import org.cvut.navi.model.Crosswalk;
import org.cvut.navi.model.IndividualStatistic;
import org.cvut.navi.model.NaviRequest;
import org.cvut.navi.model.Participant;
import org.cvut.navi.model.Platform;
import org.cvut.navi.model.Point;
import org.cvut.navi.model.SearchOrigin;
import org.cvut.navi.model.Sidewalk;
import org.cvut.navi.model.Zebra;
import org.cvut.navi.repository.IndividualStatsRepository;
import org.cvut.navi.repository.ParticipantRepository;
import org.cvut.navi.util.GeneralUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

@Service
@Transactional
public class NaviterierInitializer {

	private Logger logger = LoggerFactory.getLogger(NaviterierInitializer.class);
	private static final String CROSSWAYS = "CrossWays";
	private static final String CROSSWAY_TYPE = "CrossingType";
	private static final String SEGMENTS = "Segments";
	private static final String ID = "Id";
	private static final String POINTS = "Points";
	private static final String SHAPE = "Shape";
	private static final String LATITUTE = "Latitude";
	private static final String LONGTITUDE = "Longitude";
	private static final String FORM_OF_WAY = "FormOfWay";
	private static final String PAVEMENT = "Platform";
	private static final String PAVEMENT_PEDESTRIAN_ZONE = "PedestrianZone";
	private static final String PAVEMENT_NAME = "Name";
	private static Integer SEQUENCE = 1;
	private static final Integer CORNER_IMAGE_COUNT = 15;
	private static Integer CORNER_ITERATOR = 0;
	private static final Integer CROSSWALK_IMAGE_COUNT = 39;
	private static final Integer SIDEWALK_IMAGE_COUNT = 30;
	private static Integer COUNTER = 0;
	private static Integer SEGMENTS_COUNTER = 80;
	private static final String NAVI_FILENAME = "segments";
	private static final BigDecimal RADIUS = new BigDecimal(250);
	private Set<Crosswalk> c = new HashSet<Crosswalk>();
	private Set<Sidewalk> s = new HashSet<Sidewalk>();
	private Set<Corner> corners = new HashSet<Corner>();
	@Autowired
	private IndividualStatsRepository individualStatsRepo;

	public static final String NAVITERIER_API = "http://147.32.81.71/NaviTerier.ProcessingService/json/reply/FindSourceData";
	@Autowired
	private RestTemplate restTemplate;
	private static List<Participant> p = new ArrayList<Participant>();

	@Autowired
	private ParticipantRepository participantRepo;
	private int MID_INDEX;

	public void fetchDataFromNaviterier() throws IOException {

		ClassPathResource cpr = new ClassPathResource("coordinates");

		List<String> strCoordinates = IOUtils.readLines(cpr.getInputStream(), StandardCharsets.UTF_8);
		logger.info("we have found {} coordinates", strCoordinates.size());

		strCoordinates.forEach(gps -> {

			String[] latlon = gps.split(",");
			NaviRequest req = new NaviRequest();
			SearchOrigin s = new SearchOrigin();
			s.setLatitude(new BigDecimal(latlon[0]));
			s.setLongitude(new BigDecimal(latlon[1]));
			req.setSearchOrigin(s);
			req.setRadius(RADIUS);
			ObjectMapper mapper = new ObjectMapper();
			try {
				logger.info("Executing request for {}", mapper.writeValueAsString(req));
			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}

			HttpEntity<NaviRequest> request = new HttpEntity<>(req);

			ResponseEntity<String> naviResponse = restTemplate.postForEntity(NAVITERIER_API, request, String.class);

			logger.info("Saving response to a file:" + NAVI_FILENAME + COUNTER + ".json");
			PrintWriter out = null;
			try {

				JsonNode root = mapper.readTree(naviResponse.getBody());
				out = new PrintWriter(NAVI_FILENAME + COUNTER + ".json");
				out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(root));
				out.close();
				COUNTER++;
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}

		});

	}

	public void initWithNaviterierData() throws IOException {

		COUNTER = 0;

		logger.info("calling init with navi data");

		initParticipants();

		ClassPathResource cprs = new ClassPathResource("corners");
		

		p.forEach(p -> {
			c = new HashSet<Crosswalk>();
			s = new HashSet<Sidewalk>();
			corners = new HashSet<Corner>();

			for (int i = 0; i < SEGMENTS_COUNTER; i++) {

				String filename = NAVI_FILENAME + i + ".json";
				logger.info("parsing file {}", filename);
				ClassPathResource cpr = new ClassPathResource(filename);
				ObjectMapper mapper = new ObjectMapper();
				JsonNode json = null;
				InputStream is = null;
				try {
					is = cpr.getInputStream();
					json = mapper.readTree(is);
				} catch (IOException e) {

					e.printStackTrace();
				}
				c.addAll(initCrosswalks(json));
				s.addAll(initSidewalks(json));

				try {
					is.close();
				} catch (IOException e) {
					e.printStackTrace();
				}

			}
			p.setCrosswalks(c);
			p.setSidewalks(s);

			try {
				corners = initCorners(cprs);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			corners.forEach(cr -> {

				p.addCorner(cr);
			});
			logger.info("Saving participant {}", p.getUsername());
			logger.info("Sidewalk count per participant {}", s.size());
			logger.info("Crosswalk count per participant {}", c.size());
			logger.info("Corner count per participant {}", corners.size());
			IndividualStatistic is = new IndividualStatistic();
			is.setUsername(p.getUsername());
			is.setCrosswalkCount(0L);
			is.setCornerCount(0L);
			is.setObstacleCount(0L);
			is.setSidewalkCount(0L);
			is.setAccuracy(new BigDecimal(0));
			participantRepo.save(p);
			individualStatsRepo.save(is);

		});
		logger.info("Initialization finished");
	}

	private Set<Corner> initCorners(ClassPathResource cpr) throws IOException {
		
		InputStream jsonCorners = cpr.getInputStream();

		Set<Corner> tmp = new HashSet<Corner>();

		List<String> strCoordinates = IOUtils.readLines(jsonCorners, StandardCharsets.UTF_8);
		logger.info("we have found {} coordinates", strCoordinates.size());
		CORNER_ITERATOR = 0;

		strCoordinates.forEach(gps -> {
			CORNER_ITERATOR++;
			String[] latlon = gps.split(",");
			Point s = new Point();
			s.setLat(new BigDecimal(latlon[0].trim()));
			s.setLon(new BigDecimal(latlon[1].trim()));
			Corner c = new Corner();
			c.setBusinessKey(Long.valueOf(CORNER_ITERATOR + CORNER_IMAGE_COUNT));
			c.setGps(s);
			tmp.add(c);

		});

		IntStream stream = IntStream.range(0, CORNER_IMAGE_COUNT);
		stream.forEach(i -> {
			tmp.add(generateCorner(i));
		});
		
		jsonCorners.close();

		return tmp;
	}

	private Crosswalk generateCrosswalk(Integer count) {

		Crosswalk c = new Crosswalk();
		c.setImageName("crosswalk" + count + ".jpg");
		c.setNaviterierId(Long.valueOf(count));

		Zebra z = new Zebra();
		c.setZebra(z);

		Platform start = new Platform();
		c.setStartPlatform(start);

		Platform end = new Platform();
		c.setEndPlatform(end);
		return c;
	}

	private Sidewalk generateSidewalk(Integer count) {

		Sidewalk sidewalk = new Sidewalk();
		sidewalk.setNaviterierId(Long.valueOf(count));
		sidewalk.setImageName("sidewalk" + count + ".jpg");
		return sidewalk;
	}

	private Corner generateCorner(Integer count) {

		Corner corner = new Corner();
		corner.setImageName("corner" + count + ".jpg");
		corner.setBusinessKey(Long.valueOf(count));

		return corner;
	}

	private Set<Sidewalk> initSidewalks(JsonNode json) {
		ArrayNode ja = (ArrayNode) json.get(SEGMENTS);

		List<JsonNode> eligibleSegments = new ArrayList<JsonNode>();
		Set<Sidewalk> sidewalks = new HashSet<Sidewalk>();

		eligibleSegments.addAll(getPavementByType(ja, PAVEMENT));
		eligibleSegments.addAll(getPavementByType(ja, PAVEMENT_PEDESTRIAN_ZONE));

		eligibleSegments.forEach(es -> {

			Sidewalk s = new Sidewalk();
			s.setNaviterierId(es.get(ID).asLong());

			ArrayNode points = (ArrayNode) es.get(SHAPE).get(POINTS);
			SortedSet<Point> sidewalkPoints = new TreeSet<Point>(Comparator.comparing(Point::getSequence));
			SEQUENCE = 1;

			points.forEach(sp -> {

				Point point = new Point();
				point.setLat(new BigDecimal(sp.get(LATITUTE).asDouble()));
				point.setLon(new BigDecimal(sp.get(LONGTITUDE).asDouble()));
				point.setSequence(SEQUENCE++);
				sidewalkPoints.add(point);

			});

			s.setPoints(sidewalkPoints);
			calculateMidPoint(s, points);
			sidewalks.add(s);

		});

		IntStream imgStream = IntStream.range(0, SIDEWALK_IMAGE_COUNT);
		imgStream.forEach(i -> {
			sidewalks.add(generateSidewalk(i));
		});

		return sidewalks;
	}

	private Collection<? extends JsonNode> getPavementByType(ArrayNode pavement, String pavementType) {

		Stream<JsonNode> pavementStream = StreamSupport.stream(pavement.spliterator(), false);

		return pavementStream.filter(jn -> jn.get(FORM_OF_WAY).asText().equals(pavementType)).filter(jn -> !jn.get(PAVEMENT_NAME).asText().trim().isEmpty()).collect(Collectors.toList());
	}

	private void calculateMidPoint(Sidewalk sidewalk, ArrayNode points) {
		if (sidewalk.getPoints().size() == 2) {

			Point start = new Point();
			JsonNode jsonStart = points.get(0);
			start.setLat(new BigDecimal(jsonStart.get(LATITUTE).asDouble()));
			start.setLon(new BigDecimal(jsonStart.get(LONGTITUDE).asDouble()));
			Point end = new Point();
			JsonNode jsonEnd = points.get(points.size() - 1);
			end.setLat(new BigDecimal(jsonEnd.get(LATITUTE).asDouble()));
			end.setLon(new BigDecimal(jsonEnd.get(LONGTITUDE).asDouble()));
			sidewalk.setMid(GeneralUtils.midPoint(start, end));
			return;
		}

		MID_INDEX = 0;
		if (sidewalk.getPoints().size() % 2 == 0) {

			MID_INDEX = (sidewalk.getPoints().size() / 2);
		} else {
			BigDecimal tmp = new BigDecimal((double) sidewalk.getPoints().size() / 2);
			MID_INDEX = tmp.intValue() + 1;

		}
		sidewalk.getPoints().forEach(p -> {

			if (p.getSequence().equals(MID_INDEX)) {
				Point mid = new Point();
				mid.setLat(p.getLat());
				mid.setLon(p.getLon());
				sidewalk.setMid(mid);
				return;

			}

		});

	}

	public Set<Crosswalk> initCrosswalks(JsonNode json) {
		JsonNode crossways = json.get(CROSSWAYS);
		Set<Crosswalk> crosswalks = getCrosswalks(crossways);
		annotateCrosswalks(crosswalks, json.get(SEGMENTS));

		IntStream imgStream = IntStream.range(0, CROSSWALK_IMAGE_COUNT);
		imgStream.forEach(i -> {
			crosswalks.add(generateCrosswalk(i));
		});
		return crosswalks;

	}

	private void initParticipants() {

		/**
		 * liska jelen panda opice myval zajic kun slon
		 */
		p.clear();
		p.add(generateParticipant("liska"));
		p.add(generateParticipant("jelen"));
		p.add(generateParticipant("panda"));
		p.add(generateParticipant("opice"));
		p.add(generateParticipant("myval"));
		p.add(generateParticipant("zajic"));
		p.add(generateParticipant("slon"));

	}

	private Participant generateParticipant(String username) {

		Participant p = new Participant();
		p.setUsername(username);
		return p;
	}

	private void annotateCrosswalks(Set<Crosswalk> crosswalks, JsonNode segments) {

		crosswalks.forEach(c -> {

			Zebra zebra = new Zebra();
			c.setZebra(zebra);

			for (final JsonNode segNode : segments) {

				// find corresponding segment
				if (Long.valueOf(segNode.get(ID).asLong()).equals(c.getNaviterierId())) {

					// find crosswalk points

					JsonNode shapes = segNode.get(SHAPE);
					ArrayNode points = (ArrayNode) shapes.get(POINTS);

					Point start = new Point();
					start.setLat(new BigDecimal(points.get(0).get(LATITUTE).asDouble()));
					start.setLon(new BigDecimal(points.get(0).get(LONGTITUDE).asDouble()));
					Platform startPlatform = new Platform();
					startPlatform.setGps(start);

					Point end = new Point();
					end.setLat(new BigDecimal(points.get(points.size() - 1).get(LATITUTE).asDouble()));
					end.setLon(new BigDecimal(points.get(points.size() - 1).get(LONGTITUDE).asDouble()));
					Platform endPlatform = new Platform();
					endPlatform.setGps(end);

					c.setStartPlatform(startPlatform);
					c.setEndPlatform(endPlatform);

					Point mid = GeneralUtils.midPoint(start, end);
					c.getZebra().setMid(mid);
				}
			}

		});

	}

	public Set<Crosswalk> getCrosswalks(JsonNode crossways) {

		Set<Crosswalk> crosswalks = new HashSet<Crosswalk>();

		for (final JsonNode objNode : crossways) {

			Crosswalk c = new Crosswalk();
			c.setNaviterierId((objNode.get(ID).asLong()));
			c.setCrossWalkType(objNode.get(CROSSWAY_TYPE).asText());

			crosswalks.add(c);
		}

		return crosswalks;
	}

	@Bean
	public RestTemplate restTemplate(RestTemplateBuilder builder) {
		// Do any additional configuration here
		return builder.build();
	}

}

package org.cvut.navi.rest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.cvut.navi.model.Corner;
import org.cvut.navi.model.Crosswalk;
import org.cvut.navi.model.IndividualStatistic;
import org.cvut.navi.model.IndividualStatisticDTO;
import org.cvut.navi.model.Obstacle;
import org.cvut.navi.model.Participant;
import org.cvut.navi.model.Platform;
import org.cvut.navi.model.Sidewalk;
import org.cvut.navi.model.UnmappedCount;
import org.cvut.navi.model.UserAuditLog;
import org.cvut.navi.model.Zebra;
import org.cvut.navi.repository.CornerRepository;
import org.cvut.navi.repository.CrosswalkRepository;
import org.cvut.navi.repository.IndividualStatsRepository;
import org.cvut.navi.repository.ParticipantRepository;
import org.cvut.navi.repository.PlatformRepository;
import org.cvut.navi.repository.SidewalkRepository;
import org.cvut.navi.repository.UserAuditLogRepository;
import org.cvut.navi.repository.ZebraRepository;
import org.cvut.navi.service.NaviterierInitializer;
import org.cvut.navi.service.SegmentServices;
import org.cvut.navi.util.RuntimeStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

@RestController
@RequestMapping("/api")
public class NaviAPI {

	@ExceptionHandler({ Exception.class })
	public void handleException(Exception e) {

		String error = ExceptionUtils.getStackTrace(e);

		logger.info("custom exception handler triggered : {}", error);
		RuntimeStatus.MESSAGE = error;
	}

	@Autowired
	private NaviterierInitializer navi;

	@Autowired
	private ParticipantRepository participantRepo;

	@Autowired
	private CrosswalkRepository crosswalkRepo;

	@Autowired
	private UserAuditLogRepository auditRepo;

	@Autowired
	private CornerRepository cornerRepo;

	@Autowired
	private SidewalkRepository sidewalkRepo;

	@Autowired
	private ZebraRepository zebraRepository;

	@Autowired
	private SegmentServices segmentServices;

	@Autowired
	private IndividualStatsRepository statsRepo;

	private Logger logger = LoggerFactory.getLogger(NaviAPI.class);

	private Integer sidewalkCounter = 0;
	private Integer crosswalkCounter = 0;

	@Autowired
	private PlatformRepository platformRepo;

	@PostMapping("/fetchFromNaviterier")
	@ApiOperation(value = "Download data from naviterier API and saves them into a file")
	public ResponseEntity<?> fetchDataFromNavi() throws IOException {
		logger.info("Fetching data from naviterier API");
		navi.fetchDataFromNaviterier();
		return ResponseEntity.ok().build();

	}

	@PostMapping("/error/ack")
	public ResponseEntity<?> ackError() {
		RuntimeStatus.MESSAGE = "OK";
		return ResponseEntity.ok().build();

	}

	@PostMapping("/init")
	@ApiOperation(value = "Init database with data")
	public ResponseEntity<?> initWithNaviData() throws IOException {
		logger.info("Initializing navi DB with data");
		long participantCount = participantRepo.count();
		if (participantCount == 0) {
			navi.initWithNaviterierData();
			return ResponseEntity.ok().build();
		}
		return ResponseEntity.badRequest().body("DB already initialized");
	}

	@PutMapping("/crosswalk/{id}/{username}")
	@ApiOperation(value = "Update crosswalk", notes = "Update already existing Crosswalk - ID param is required", response = Crosswalk.class)
	public ResponseEntity<Crosswalk> updateCrosswalk(@RequestParam(name = "count") Optional<Long> count,
			@PathVariable("id") Long id, @Valid @RequestBody Crosswalk crosswalk,
			@PathVariable("username") String username) {

		logger.info("Updating crosswalk {} for user {} with count {}", id, username, count);

		if (!crosswalkRepo.findById(id).isPresent()) {
			logger.info("Adding a new crosswalk");
			Participant p = participantRepo.findByUsername(username);
			p.getCrosswalks().add(crosswalk);
			participantRepo.save(p);
			return ResponseEntity.ok(crosswalk);
		}

		if (count.isPresent()) {
			IndividualStatistic is = statsRepo.findByUsername(username);
			is.setCrosswalkCount(is.getCrosswalkCount() + count.get());
			statsRepo.save(is);
		}

		return ResponseEntity.ok(crosswalkRepo.save(crosswalk));
	}

	@PutMapping("/corner/{id}/{username}")
	@ApiOperation(value = "Update corner", notes = "Update already existing Corner - ID param is required", response = Corner.class)

	public ResponseEntity<Corner> updateCorner(@PathVariable("username") String username,
			@RequestParam("count") Optional<Long> count, @PathVariable("id") Long id,
			@Valid @RequestBody Corner corner) {
		logger.info("Updating corner {} for user {} with count {}", id, username, count);

		if (!cornerRepo.findById(id).isPresent()) {
			logger.info("Corner not found - adding it");
			Participant p = participantRepo.findByUsername(username);
			p.addCorner(corner);
			participantRepo.save(p);
			return ResponseEntity.ok(corner);

		}

		if (count.isPresent()) {
			IndividualStatistic is = statsRepo.findByUsername(username);
			is.setCornerCount(is.getCornerCount() + count.get());
			statsRepo.save(is);
		}

		return ResponseEntity.ok(cornerRepo.save(corner));
	}

	@PutMapping("/platform/{id}/{username}")
	@ApiOperation(value = "Update platform", notes = "Update already existing Platform - ID param is required", response = Platform.class)
	public ResponseEntity<Platform> updatePlatform(@PathVariable("username") String username,
			@RequestParam("count") Long count, @PathVariable("id") Long id, @Valid @RequestBody Platform platform) {
		logger.info("Updating platform {} for user {} with count {}", id, username, count);

		if (!platformRepo.findById(id).isPresent()) {
			logger.error("Platform not found");
			return ResponseEntity.badRequest().build();
		}
		IndividualStatistic is = statsRepo.findByUsername(username);
		is.setCrosswalkCount(is.getCrosswalkCount() + count);
		statsRepo.save(is);

		return ResponseEntity.ok(platformRepo.save(platform));
	}

	@PutMapping("/zebra/{id}/{username}")
	@ApiOperation(value = "Update zebra", notes = "Update already existing Zebra - ID param is required", response = Zebra.class)

	public ResponseEntity<Zebra> updateZebra(@PathVariable("username") String username,
			@RequestParam("count") Long count, @PathVariable("id") Long id, @Valid @RequestBody Zebra zebra) {
		logger.info("Updating zebra {} for user {} with count {}", id, username, count);

		if (!zebraRepository.findById(id).isPresent()) {
			logger.error("Zebra not found");
			ResponseEntity.badRequest().build();

		}

		IndividualStatistic is = statsRepo.findByUsername(username);
		is.setCrosswalkCount(is.getCrosswalkCount() + count);
		statsRepo.save(is);
		return ResponseEntity.ok(zebraRepository.save(zebra));
	}

	@PutMapping("/sidewalk/{id}/{username}")
	@ApiOperation(value = "Update sidewalk", notes = "Update already existing Sidewalk - ID param is required", response = Sidewalk.class)

	public ResponseEntity<Sidewalk> updateSidewalk(@PathVariable("username") String username,
			@RequestParam("count") Optional<Long> count, @PathVariable("id") Long id,
			@Valid @RequestBody Sidewalk sidewalk) {
		logger.info("Updating sidewalk {} for user {} with count {}", id, username, count);

		if (!sidewalkRepo.findById(id).isPresent()) {
			logger.info("Adding a new sidewalk");

			Participant p = participantRepo.findByUsername(username);
			p.getSidewalks().add(sidewalk);
			participantRepo.save(p);
			return ResponseEntity.ok(sidewalk);

		}
		if (count.isPresent()) {
			IndividualStatistic is = statsRepo.findByUsername(username);
			is.setSidewalkCount(is.getSidewalkCount() + count.get());
			statsRepo.save(is);
		}

		return ResponseEntity.ok(sidewalkRepo.save(sidewalk));
	}

	@GetMapping("/participant/{username}")
	@ApiOperation(value = "Get participant's segment", notes = "Username is required, optionally query parameter 'mapped' can be specified (values are true/false)", response = Participant.class)

	public ResponseEntity<?> getParticipant(@PathVariable("username") String username,
			@RequestParam(name = "mapped") Optional<Boolean> mapped) {

		Participant p = participantRepo.findByUsername(username);
		if (p == null) {
			return ResponseEntity.badRequest().body("The participant " + username + " does not exist");
		}
		if (mapped.isPresent()) {

			logger.info("Returning mapped: {} only", mapped.get());
			segmentServices.filterSegments(p, mapped.get());
		}

		logger.info("returning response p id {}, p username {}", p.getId(), p.getUsername());
		return ResponseEntity.ok(p);

	}

	@GetMapping("/corner/{username}")
	@ApiOperation(value = "Get corners by username", notes = "Path param {username} is rqeuired, optionally query parameter fromImage (values true/false) can be specified. If true only corners which have photo associated will be returned", response = Corner.class)

	public ResponseEntity<Set<Corner>> getUnmappedImageCorners(
			@RequestParam(name = "fromImage") Optional<Boolean> fromImage, @PathVariable("username") String username) {

		Participant p = participantRepo.findByUsername(username);
		if (fromImage.isPresent()) {
			if (fromImage.get()) {
				Set<Corner> result = p.getCorners().stream().filter(c -> (c.getImageName() != null) && !c.isMapped())
						.collect(Collectors.toSet());
				logger.info("returning {} corners for user {}", result.size(), username);
				return ResponseEntity.ok(result);

			}
		}
		return ResponseEntity.noContent().build();

	}

	@PutMapping("/obstacle/{username}/add")
	@ApiOperation(value = "Add new obstacle", notes = "Add a new obstacle and link it to specified username, path param {username} is required", response = Obstacle.class)
	public ResponseEntity<Set<Obstacle>> updateObstacle(@RequestParam("count") Long count,
			@Valid @RequestBody Obstacle obstacle, @PathVariable("username") String username) {

		Participant p = participantRepo.findByUsername(username);
		if (p.getObstacles() == null)
			p.setObstacles(new HashSet<Obstacle>());

		p.getObstacles().add(obstacle);
		participantRepo.save(p);
		IndividualStatistic is = statsRepo.findByUsername(username);
		is.setObstacleCount(is.getObstacleCount() + count);
		statsRepo.save(is);
		logger.info("stored obstacle {} for user", obstacle.getId(), username);
		return ResponseEntity.ok(p.getObstacles());
	}

	@GetMapping("/sidewalk/{username}")
	@ApiOperation(value = "Get sidewalks", notes = "Get list of sidewalks by username. Query parameter fromImage (true/false) allows you to chose between sidewalks having imageName attached to it or not. Query parameter attribute allows you to specify in which unmapped attribute you are interested in - currently supported values are 'quality' and 'type'", response = Sidewalk.class)

	public ResponseEntity<Set<Sidewalk>> getUnmappedImageSidewalks(
			@ApiParam(value = "Possible values: quality, type", required = true) @RequestParam(name = "attribute") String sidewalkAttribute,
			@RequestParam(name = "fromImage") Optional<Boolean> fromImage, @PathVariable("username") String username) {

		logger.info("returning sidewalks for user {} with attribute {}", username, sidewalkAttribute);
		Set<Sidewalk> result = new HashSet<Sidewalk>();
		if (fromImage.isPresent()) {
			if (fromImage.get()) {
				Participant p = participantRepo.findByUsername(username);

				switch (sidewalkAttribute) {
				case "quality":
					result = p.getSidewalks().stream().filter(s -> s.getImageName() != null && s.getQuality() == null)
							.collect(Collectors.toSet());

					break;
				case "type":
					result = p.getSidewalks().stream().filter(s -> s.getImageName() != null && s.getType() == null)
							.collect(Collectors.toSet());
					break;
				default:
					break;
				}
			}

			return ResponseEntity.ok(result);
		}

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/crosswalk/{username}")
	@ApiOperation(value = "Get crosswalks", notes = "Get list of crosswalks by username. Query parameter fromImage (true/false) allows you to chose between crosswalks having imageName attached to it or not. Query parameter attribute allows you to specify in which unmapped attribute you are interested in - currently supported values are : platformType,numberOfStripes,zebraType,semaphore,surfaceType,surfaceQuality,tactile", response = Crosswalk.class)
	public ResponseEntity<Set<Crosswalk>> getUnmappedImageCrosswalks(
			@ApiParam(value = "Possible values platformType,numberOfStripes,zebraType,semaphore,surfaceType,surfaceQuality,tactile", required = true) @RequestParam(name = "attribute") String crosswalkAttribute,
			@RequestParam(name = "fromImage") Optional<Boolean> fromImage, @PathVariable("username") String username) {

		logger.info("returning crosswalk for user {} with attribute {}", username, crosswalkAttribute);
		Set<Crosswalk> result = new HashSet<Crosswalk>();
		if (fromImage.isPresent()) {
			if (fromImage.get()) {
				Participant p = participantRepo.findByUsername(username);

				switch (crosswalkAttribute) {
				case "platformType":

					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && (c.getEndPlatform().getPlatformType() == null))
							.collect(Collectors.toSet());
					break;
				case "numberOfStripes":
					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && c.getZebra().getNumberOfStripes() == null)
							.collect(Collectors.toSet());
					break;
				case "zebraType":
					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && c.getZebra().getZebraType() == null)
							.collect(Collectors.toSet());
					break;
				case "semaphore":
					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && c.getZebra().getLightSignal() == null)
							.collect(Collectors.toSet());
					break;
				case "surfaceType":
					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && c.getZebra().getSurfaceType() == null)
							.collect(Collectors.toSet());
					break;
				case "surfaceQuality":
					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && c.getZebra().getSurfaceQuality() == null)
							.collect(Collectors.toSet());
					break;
				case "tactile":
					result = p.getCrosswalks().stream()
							.filter(c -> c.getImageName() != null && c.getZebra().getGuidingStripe() == null)
							.collect(Collectors.toSet());
					break;
				default:
					break;
				}
			}

			return ResponseEntity.ok(result);
		}

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/crosswalk/{username}/size")
	public ResponseEntity<Integer> getNumberOfUnmappedImageCrosswalks(
			@ApiParam(value = "Possible values: platformType,numberOfStripes,zebraType,semaphore,surfaceType,surfaceQuality,tactile (can accept multiple ones as comma separated list", required = true) @RequestParam(name = "attribute") List<String> attributes,
			@RequestParam(name = "fromImage") Optional<Boolean> fromImage, @PathVariable("username") String username) {
		Participant p = participantRepo.findByUsername(username);
		crosswalkCounter = 0;
		logger.info("returning number of unmapped crosswalk attributes of type {} for user {}", attributes, username);
		attributes.forEach(a -> {
			switch (a) {
			case "platformType":

				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && (c.getEndPlatform().getPlatformType() == null))
						.collect(Collectors.toSet()).size();
				break;
			case "numberOfStripes":
				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && c.getZebra().getNumberOfStripes() == null)
						.collect(Collectors.toSet()).size();
				break;
			case "zebraType":
				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && c.getZebra().getZebraType() == null)
						.collect(Collectors.toSet()).size();
				break;
			case "semaphore":
				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && c.getZebra().getLightSignal() == null)
						.collect(Collectors.toSet()).size();
				break;
			case "surfaceType":
				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && c.getZebra().getSurfaceType() == null)
						.collect(Collectors.toSet()).size();
				break;
			case "surfaceQuality":
				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && c.getZebra().getSurfaceQuality() == null)
						.collect(Collectors.toSet()).size();
				break;
			case "tactile":
				crosswalkCounter += p.getCrosswalks().stream()
						.filter(c -> c.getImageName() != null && c.getZebra().getGuidingStripe() == null)
						.collect(Collectors.toSet()).size();
				break;
			default:
				break;
			}

		});

		return ResponseEntity.ok(crosswalkCounter);

	}

	@GetMapping("/sidewalk/{username}/size")
	public ResponseEntity<Integer> getNumberOfUnmappedImageSidewalks(
			@ApiParam(value = "Possible values: quality, type (can accept multiple ones as comma separated list", required = true) @RequestParam(name = "attribute") List<String> attributes,
			@RequestParam(name = "fromImage") Optional<Boolean> fromImage, @PathVariable("username") String username) {

		sidewalkCounter = 0;
		Participant p = participantRepo.findByUsername(username);
		logger.info("returning number of unmapped sidewalks of attribute {} for user {}", attributes, username);

		attributes.forEach(a -> {

			switch (a) {
			case "quality":
				sidewalkCounter += p.getSidewalks().stream()
						.filter(s -> s.getImageName() != null && s.getQuality() == null).collect(Collectors.toSet())
						.size();
				break;
			case "type":
				sidewalkCounter += p.getSidewalks().stream()
						.filter(s -> s.getImageName() != null && s.getType() == null).collect(Collectors.toSet())
						.size();
				break;
			default:
				break;
			}

		});
		return ResponseEntity.ok(sidewalkCounter);
	}

	@GetMapping("/count/{username}/all")
	@ApiOperation(value = "Get count for all unmapped attributes from the picture by the given user")
	public ResponseEntity<?> getAllCountUnmappedImageAttributes(
			@RequestParam(name = "fromImage", required = true) Boolean fromImage,
			@PathVariable("username") String username) {
		Participant p = participantRepo.findByUsername(username);

		if (p == null) {

			return ResponseEntity.badRequest().body("The participant " + username + " does not exist");

		}

		logger.info("returning number of all unmapped attributes for user {}", username);

		UnmappedCount result = new UnmappedCount();

		result.setSidewalkQuality(p.getSidewalks().stream()
				.filter(s -> s.getImageName() != null && s.getQuality() == null).collect(Collectors.toSet()).size());
		result.setSidewalkType(p.getSidewalks().stream().filter(s -> s.getImageName() != null && s.getType() == null)
				.collect(Collectors.toSet()).size());

		result.setCorners(p.getCorners().stream().filter(c -> (c.getImageName() != null) && !c.isMapped())
				.collect(Collectors.toSet()).size());

		result.setPlatformType(p.getCrosswalks().stream()
				.filter(c -> c.getImageName() != null && (c.getEndPlatform().getPlatformType() == null))
				.collect(Collectors.toSet()).size());

		result.setZebraType(
				p.getCrosswalks().stream().filter(c -> c.getImageName() != null && c.getZebra().getZebraType() == null)
						.collect(Collectors.toSet()).size());

		result.setSemaphore(p.getCrosswalks().stream()
				.filter(c -> c.getImageName() != null && c.getZebra().getLightSignal() == null)
				.collect(Collectors.toSet()).size());

		result.setZebraSurfaceType(p.getCrosswalks().stream()
				.filter(c -> c.getImageName() != null && c.getZebra().getSurfaceType() == null)
				.collect(Collectors.toSet()).size());

		result.setZebraSurfaceQuality(p.getCrosswalks().stream()
				.filter(c -> c.getImageName() != null && c.getZebra().getSurfaceQuality() == null)
				.collect(Collectors.toSet()).size());

		result.setTactile(p.getCrosswalks().stream()
				.filter(c -> c.getImageName() != null && c.getZebra().getGuidingStripe() == null)
				.collect(Collectors.toSet()).size());

		result.setNumberOfStripes(p.getCrosswalks().stream()
				.filter(c -> c.getImageName() != null && c.getZebra().getNumberOfStripes() == null)
				.collect(Collectors.toSet()).size());

		return ResponseEntity.ok(result);

	}

	@GetMapping("/corner/{username}/size")
	@ApiOperation(value = "Number of corners", notes = "Return number of corners linked to a specific username, path param {username} is required", response = Integer.class)
	public ResponseEntity<Integer> getNumberOfUnmappedImageCorners(
			@RequestParam(name = "fromImage") Optional<Boolean> fromImage, @PathVariable("username") String username) {
		Participant p = participantRepo.findByUsername(username);
		logger.info("number of unmapped corners for user {}", username);
		Set<Corner> result = null;
		if (fromImage.isPresent()) {
			if (fromImage.get()) {
				result = p.getCorners().stream().filter(c -> (c.getImageName() != null) && !c.isMapped())
						.collect(Collectors.toSet());
				if (result == null || result.isEmpty()) {
					return ResponseEntity.ok(new Integer(0));
				}
			}
		}

		return ResponseEntity.ok(new Integer(result.size()));
	}

	@GetMapping("/stats/all")
	public ResponseEntity<List<IndividualStatisticDTO>> getStats() {
		logger.info("returning all stats");

		List<IndividualStatistic> tmp = statsRepo.findAll();
		List<IndividualStatisticDTO> src = new ArrayList<IndividualStatisticDTO>();

		tmp.forEach(t -> {

			IndividualStatisticDTO isdto = new IndividualStatisticDTO();
			isdto.setUsername(t.getUsername());
			isdto.setAll(t.getAll());
			src.add(isdto);
		});

		List<IndividualStatisticDTO> result = src.stream()
				.sorted(Comparator.comparing(IndividualStatisticDTO::getAll).reversed()).collect(Collectors.toList());

		return ResponseEntity.ok(result);

	}

	@PutMapping("/audit/add")
	public ResponseEntity<UserAuditLog> storeAuditLog(@RequestBody @Valid UserAuditLog audit) {
		logger.info("Storing {}", audit);
		return ResponseEntity.ok(auditRepo.save(audit));

	}

	@GetMapping("/stats/{username}")
	public ResponseEntity<IndividualStatistic> getIndividualStatistics(@PathVariable("username") String username) {

		logger.info("returning individual stats for user {}", username);
		IndividualStatistic result = statsRepo.findByUsername(username);
		if (result != null) {
			return ResponseEntity.ok(result);
		}

		logger.info("there is no finding");
		return ResponseEntity.noContent().build();
	}

}

package org.cvut.navi.service;

import java.util.HashSet;
import java.util.Set;

import org.cvut.navi.model.Corner;
import org.cvut.navi.model.Crosswalk;
import org.cvut.navi.model.Participant;
import org.cvut.navi.model.Sidewalk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SegmentServices {
	private Logger logger = LoggerFactory.getLogger(SegmentServices.class);

	public void filterSegments(Participant p, Boolean mapped) {

		Set<Crosswalk> c = p.getCrosswalks();

		Set<Sidewalk> s = p.getSidewalks();

		Set<Corner> corners = p.getCorners();

		Set<Crosswalk> filteredC = new HashSet<Crosswalk>();
		Set<Sidewalk> filteredS = new HashSet<Sidewalk>();
		Set<Corner> filteredCorners = new HashSet<Corner>();

		c.forEach(cw -> {
		//	logger.info("Checking whether crosswalk {} is mapped", cw.getId());

			if (mapped) {

				if (cw.isMapped()) {

					filteredC.add(cw);
				}
			} else {
				if (!cw.isMapped()) {
					filteredC.add(cw);
				}
			}
		});

		s.forEach(sw -> {
		//	logger.info("Checking whether sidewalk {} is mapped", sw.getId());

			if (mapped) {
				if (sw.isMapped()) {
					filteredS.add(sw);
				}
			} else {
				if (!sw.isMapped()) {
					filteredS.add(sw);
				}
			}

		});

		corners.forEach(corner -> {
			//logger.info("Checking whether corner {} is mapped", corner.getId());

			if (mapped) {
				if (corner.isMapped()) {
					filteredCorners.add(corner);
				}
			} else {
				if (!corner.isMapped()) {
					filteredCorners.add(corner);
				}
			}

		});

		p.setCrosswalks(filteredC);
		logger.info("returning {} crosswalks", filteredC.size());
		p.setSidewalks(filteredS);
		logger.info("returning {} sidewalks", filteredS.size());
		p.setCorners(filteredCorners);
		logger.info("returning {} corners", filteredCorners.size());

	}

}

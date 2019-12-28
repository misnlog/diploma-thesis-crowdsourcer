package org.cvut.navi.util;

import java.math.BigDecimal;

import org.cvut.navi.model.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GeneralUtils {

	private static Logger logger = LoggerFactory.getLogger(GeneralUtils.class);

	public static Point midPoint(Point start, Point end) {

		double dLon = Math.toRadians(end.getLon().doubleValue() - start.getLon().doubleValue());

		// convert to radians
		double lat1 = Math.toRadians(start.getLat().doubleValue());
		double lat2 = Math.toRadians(end.getLat().doubleValue());
		double lon1 = Math.toRadians(start.getLon().doubleValue());

		double Bx = Math.cos(lat2) * Math.cos(dLon);
		double By = Math.cos(lat2) * Math.sin(dLon);
		double lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
				Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
		double lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

		Point mid = new Point();
		mid.setLat(new BigDecimal(Math.toDegrees(lat3)));
		mid.setLon(new BigDecimal(Math.toDegrees(lon3)));

		// print out in degrees
		//logger.info("returning mid point {}", mid);
		return mid;
	}
}

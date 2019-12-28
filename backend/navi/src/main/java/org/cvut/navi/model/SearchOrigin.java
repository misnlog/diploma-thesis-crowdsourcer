package org.cvut.navi.model;

import java.io.Serializable;
import java.math.BigDecimal;

public class SearchOrigin implements Serializable {

	private static final long serialVersionUID = 1L;
	private BigDecimal Latitude;
	private BigDecimal Longitude;

	public BigDecimal getLatitude() {
		return Latitude;
	}

	public void setLatitude(BigDecimal latitude) {
		Latitude = latitude;
	}

	public BigDecimal getLongitude() {
		return Longitude;
	}

	public void setLongitude(BigDecimal longitude) {
		Longitude = longitude;
	}

}

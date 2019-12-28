package org.cvut.navi.model;

import java.math.BigDecimal;

public class NaviRequest extends Auditable {
	
	private SearchOrigin SearchOrigin;
	private BigDecimal Radius;
	
	
	public SearchOrigin getSearchOrigin() {
		return SearchOrigin;
	}
	public void setSearchOrigin(SearchOrigin searchOrigin) {
		SearchOrigin = searchOrigin;
	}
	public BigDecimal getRadius() {
		return Radius;
	}
	public void setRadius(BigDecimal radius) {
		Radius = radius;
	}

}

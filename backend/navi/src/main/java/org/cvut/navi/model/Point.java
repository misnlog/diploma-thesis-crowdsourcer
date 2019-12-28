package org.cvut.navi.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Point extends Auditable implements Comparable<Point> {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)

	private Long id;

	@Column(precision = 17, scale = 13)
	private BigDecimal lat;
	@Column(precision = 17, scale = 13)
	private BigDecimal lon;

	private Integer sequence;

	public Integer getSequence() {
		return sequence;
	}

	public void setSequence(Integer sequence) {
		this.sequence = sequence;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public BigDecimal getLat() {
		return lat;
	}

	public void setLat(BigDecimal lat) {
		this.lat = lat;
	}

	public BigDecimal getLon() {
		return lon;
	}

	public void setLon(BigDecimal lon) {
		this.lon = lon;
	}

	@Override
	public String toString() {
		return "Point [lat=" + lat + ", lon=" + lon + "]";
	}

	@Override
	public int compareTo(Point o) {
		return this.getSequence().compareTo(o.getSequence());
	}

}

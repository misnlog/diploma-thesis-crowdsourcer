package org.cvut.navi.model;

import java.math.BigDecimal;
import java.util.SortedSet;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.OrderBy;
import javax.persistence.Transient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
public class Sidewalk extends Auditable {

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((naviterierId == null) ? 0 : naviterierId.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Sidewalk other = (Sidewalk) obj;
		if (naviterierId == null) {
			if (other.naviterierId != null)
				return false;
		} else if (!naviterierId.equals(other.naviterierId))
			return false;
		return true;
	}

	@Transient
	private Logger logger = LoggerFactory.getLogger(Sidewalk.class);
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	private Long naviterierId;
	private String type;
	private String quality;
	private String leftSurroundings;
	private String rightSurroundings;
	private BigDecimal passableWidth;
	private String slope;
	private String imageName;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "sidewalk_id", referencedColumnName = "id")
	@OrderBy("sequence ASC")
	private SortedSet<Point> points;

	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "mid_id", referencedColumnName = "id")
	private Point mid;

	public Point getMid() {
		return mid;
	}

	public void setMid(Point mid) {
		this.mid = mid;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getNaviterierId() {
		return naviterierId;
	}

	public void setNaviterierId(Long naviterierId) {
		this.naviterierId = naviterierId;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getQuality() {
		return quality;
	}

	public void setQuality(String quality) {
		this.quality = quality;
	}

	public String getLeftSurroundings() {
		return leftSurroundings;
	}

	public void setLeftSurroundings(String leftSurroundings) {
		this.leftSurroundings = leftSurroundings;
	}

	public String getRightSurroundings() {
		return rightSurroundings;
	}

	public void setRightSurroundings(String rightSurroundings) {
		this.rightSurroundings = rightSurroundings;
	}

	public BigDecimal getPassableWidth() {
		return passableWidth;
	}

	public void setPassableWidth(BigDecimal passableWidth) {
		this.passableWidth = passableWidth;
	}

	public String getSlope() {
		return slope;
	}

	public void setSlope(String slope) {
		this.slope = slope;
	}

	public SortedSet<Point> getPoints() {
		return points;
	}

	public void setPoints(SortedSet<Point> points) {
		this.points = points;
	}

	public String getImageName() {
		return imageName;
	}

	public void setImageName(String imageName) {
		this.imageName = imageName;
	}

	public Boolean isMapped() {

		if (type != null && quality != null && leftSurroundings != null && rightSurroundings != null
				&& passableWidth != null && slope != null) {
			return true;
		}
		return false;
	}

}

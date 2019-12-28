package org.cvut.navi.model;

import java.math.BigDecimal;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class Obstacle extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private String type;
	private String sidewalkPosition;
	private BigDecimal passableWidth;
	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "point_id", referencedColumnName = "id")
	private Point point;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getSidewalkPosition() {
		return sidewalkPosition;
	}

	public void setSidewalkPosition(String sidewalkPosition) {
		this.sidewalkPosition = sidewalkPosition;
	}

	public BigDecimal getPassableWidth() {
		return passableWidth;
	}

	public void setPassableWidth(BigDecimal passableWidth) {
		this.passableWidth = passableWidth;
	}

	public Point getPoint() {
		return point;
	}

	public void setPoint(Point point) {
		this.point = point;
	}
	

	@Override
	public String toString() {
		return "Obstacle [id=" + id + ", type=" + type + ", sidewalkPosition=" + sidewalkPosition + ", passableWidth="
				+ passableWidth + ", point=" + point + "]";
	}


}

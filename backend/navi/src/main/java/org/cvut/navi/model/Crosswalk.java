package org.cvut.navi.model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
public class Crosswalk extends Auditable {
	@Transient
	private Logger logger = LoggerFactory.getLogger(Crosswalk.class);

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private Long naviterierId;

	private String crossWalkType;
	
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
		Crosswalk other = (Crosswalk) obj;
		if (naviterierId == null) {
			if (other.naviterierId != null)
				return false;
		} else if (!naviterierId.equals(other.naviterierId))
			return false;
		return true;
	}

	private String imageName;

	@ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "startPlatform_id", referencedColumnName = "id")
	private Platform startPlatform;
	@ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "endPlatform_id", referencedColumnName = "id")
	private Platform endPlatform;

	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "zebra_id", referencedColumnName = "id")
	private Zebra zebra;

	public Zebra getZebra() {
		return zebra;
	}

	public void setZebra(Zebra zebra) {
		this.zebra = zebra;
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

	public String getCrossWalkType() {
		return crossWalkType;
	}

	public void setCrossWalkType(String crossWalkType) {
		this.crossWalkType = crossWalkType;
	}

	public String getImageName() {
		return imageName;
	}

	public void setImageName(String imageName) {
		this.imageName = imageName;
	}

	public Platform getStartPlatform() {
		return startPlatform;
	}

	public void setStartPlatform(Platform startPlatform) {
		this.startPlatform = startPlatform;
	}

	public Platform getEndPlatform() {
		return endPlatform;
	}

	public void setEndPlatform(Platform endPlatform) {
		this.endPlatform = endPlatform;
	}

	@Override
	public String toString() {
		return "Crosswalk [id=" + id + ", naviterierId=" + naviterierId + ", crossWalkType=" + crossWalkType
				+ ", startPlatform=" + startPlatform + ", endPlatform=" + endPlatform + ", zebra=" + zebra + "]";
	}

	public Boolean isMapped() {

		if (zebra.isMapped() && startPlatform.isMapped() && endPlatform.isMapped()) {
	//		logger.info("Crosswalk {} is mapped", this.getId());
			return true;
		}
	//	logger.info("Crosswalk {} is not mapped completely", this.getId());

		return false;
	}

}

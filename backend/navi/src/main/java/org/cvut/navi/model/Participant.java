package org.cvut.navi.model;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

@Entity
public class Participant extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	private String username;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "participant_id", referencedColumnName = "id")
	private Set<Crosswalk> crosswalks;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "participant_id", referencedColumnName = "id")
	private Set<Sidewalk> sidewalks;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "participant_id", referencedColumnName = "id")
	private Set<Obstacle> obstacles;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "participant_id", referencedColumnName = "id")
	private Set<Corner> corners = new HashSet<Corner>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Set<Crosswalk> getCrosswalks() {
		return crosswalks;
	}

	public void setCrosswalks(Set<Crosswalk> crosswalks) {
		this.crosswalks = crosswalks;
	}

	public Set<Sidewalk> getSidewalks() {
		return sidewalks;
	}

	public void setSidewalks(Set<Sidewalk> sidewalks) {
		this.sidewalks = sidewalks;
	}

	public Set<Corner> getCorners() {
		return corners;
	}

	public void setCorners(Set<Corner> corners) {
		this.corners = corners;
	}

	public void addCorner(Corner corner) {
		this.corners.add(corner);
	}

	public Set<Obstacle> getObstacles() {
		return obstacles;
	}

	public void setObstacles(Set<Obstacle> obstacles) {
		this.obstacles = obstacles;
	}

	@Override
	public String toString() {
		return "Participant [id=" + id + ", username=" + username + ", crosswalks=" + crosswalks + "]";
	}

}

package org.cvut.navi.repository;

import org.cvut.navi.model.Point;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointRepository extends JpaRepository<Point, Long> {

}

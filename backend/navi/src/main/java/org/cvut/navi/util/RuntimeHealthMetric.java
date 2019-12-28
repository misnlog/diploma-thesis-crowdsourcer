package org.cvut.navi.util;

import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
public class RuntimeHealthMetric extends AbstractHealthIndicator {
	@Override
	protected void doHealthCheck(Health.Builder bldr) throws Exception {
		if (RuntimeStatus.MESSAGE.equals("OK")) {
			bldr.up().withDetail("RuntimeStatus", RuntimeStatus.MESSAGE);
		} else {
			bldr.down().withDetail("RuntimeStatus", RuntimeStatus.MESSAGE);
		}
	}
}

<?php
namespace Opencart\Catalog\Controller\Extension\Rex\Startup;
class Rexcore extends \Opencart\System\Engine\Controller {
	public function index(): void {
		if ($this->config->get('other_rexcore_status') && $this->config->get('other_rexcore_mobile_detect')) {
			$detect = new \Opencart\System\Library\Extension\Rex\MobileDetect;
			$device = ($detect->isMobile() && !$detect->isTablet()) ? 'mobile' : 'pc';
			$this->config->set('config_detected_device', $device);
		}
	}
}
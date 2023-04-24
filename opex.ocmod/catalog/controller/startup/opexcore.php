<?php
namespace Opencart\Catalog\Controller\Extension\Opex\Startup;
class Opexcore extends \Opencart\System\Engine\Controller {
	public function index(): void {
		if ($this->config->get('other_opexcore_status') && $this->config->get('other_opexcore_mobile_detect')) {
			$detect = new \Opencart\System\Library\Extension\Opex\MobileDetect;
			$device = ($detect->isMobile() && !$detect->isTablet()) ? 'mobile' : 'pc';
			$this->config->set('config_detected_device', $device);
		}
	}
}

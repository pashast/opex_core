<?php
namespace Opencart\Catalog\Controller\Extension\Rex\Other;
class Rexcore extends \Opencart\System\Engine\Controller {
	public function moduleView(array $setting): bool {
		$unload = false;

		if ($setting['module_view_enable_filters']) {
			if ($setting['module_view_mobile'] && $this->config->get('other_rexcore_mobile_detect')) {
				if ($setting['module_view_mobile'] !== $this->config->get('config_detected_device')) {
					$unload = true;
				}
			}

			if ($setting['module_view_logged']) {
				if (($setting['module_view_logged'] == 'logged') && !$this->customer->isLogged()) {
					$unload = true;
				}

				if (($setting['module_view_logged'] == 'not_logged') && $this->customer->isLogged()) {
					$unload = true;
				}
			}

			if ($this->customer->isLogged() && isset($setting['module_view_limit_customer_group']) && $setting['module_view_limit_customer_group']) {
				if (!in_array((int)$this->customer->getGroupId(), $setting['module_view_limit_customer_group'])) {
					$unload = true;
				}
			}

			if (isset($this->request->get['route'])) {
				$route = (string)$this->request->get['route'];
			} else {
				$route = 'common/home';
			}

			if (isset($setting['module_view_limit_product']) && $setting['module_view_limit_product'] && $route == 'product/product' && isset($this->request->get['product_id']) && isset($this->request->get['product_id'])) {
				if (!in_array((int)$this->request->get['product_id'], $setting['module_view_limit_product'])) {
					$unload = true;
				}
			}

			if (isset($setting['module_view_limit_category']) && $setting['module_view_limit_category'] && $route == 'product/category' && isset($this->request->get['path'])) {
				$path = explode('_', (string)$this->request->get['path']);
				if ($setting['module_view_limit_category_end']) {
					$path = array_slice($path, -1);
				}
				$result = array_intersect($path, $setting['module_view_limit_category']);
				if (!$result) {
					$unload = true;
				}
			}

			if (isset($setting['module_view_limit_manufacturer']) && $setting['module_view_limit_manufacturer'] && $route == 'product/manufacturer.info' && isset($this->request->get['manufacturer_id'])) {
				if (!in_array((int)$this->request->get['manufacturer_id'], $setting['module_view_limit_manufacturer'])) {
					$unload = true;
				}
			}
		}

		if (!$unload) {
			if (trim($setting['module_view_add_css'])) {
				foreach (explode(PHP_EOL, trim($setting['module_view_add_css'])) as $item_path) {
					$this->document->addStyle(trim($item_path));
				}
			}

			if (trim($setting['module_view_add_js'])) {
				foreach (explode(PHP_EOL, trim($setting['module_view_add_js'])) as $item_path) {
					$this->document->addScript(trim($item_path));
				}
			}

			if (trim($setting['module_view_add_js_footer'])) {
				foreach (explode(PHP_EOL, trim($setting['module_view_add_js_footer'])) as $item_path) {
					$this->document->addScript(trim($item_path), 'footer');
				}
			}
		}

		return $unload;
	}

	public function eventAddLazyModulesScript(string &$route, array &$args, mixed &$output): void {
		if (!$this->config->get('other_rexcore_lazy_script')) {
			return;
		}

		$data = [];

		$content = $this->load->view('extension/rex/common/lazy_script', $data);

		$output = str_replace(
			array(
				'</footer>',
			),
			array(
				$content . '</footer>',
			),
			$output);

	}

}
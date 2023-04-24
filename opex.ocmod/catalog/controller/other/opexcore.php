<?php
namespace Opencart\Catalog\Controller\Extension\Opex\Other;
class Opexcore extends \Opencart\System\Engine\Controller {
	public function eventAddLazyModulesScript(string &$route, array &$args, mixed &$output): void {
		if (!$this->config->get('other_opexcore_lazy_script')) {
			return;
		}

$content = '<script>
  const lazyOeModules = document.querySelectorAll(\'[data-lazy-oe-module]\');
  const lazyOeOptions = {
	root: null,
	rootMargin: \'50px\',
	threshold: 0.5,
  };

  const moduleLazyOeObserver = new IntersectionObserver(function (entries, observer) {
	entries.forEach(entry => {
	  if (entry.isIntersecting) {
		let point = entry.target;
		let url = point.getAttribute(\'data-lazy-oe-module\');
		let module_id = point.getAttribute(\'data-lazy-oe-module-id\');
		fetch(url)
		  .then(response => {
			if (!response.ok) {
			  throw new Error(\'Server error: \' + response.status);
			}
			return response.text();
		  })
		  .then(html => {
			point.innerHTML = html;
			Array.from(point.children).forEach(child => point.parentNode.insertBefore(child, point));
			point.parentNode.removeChild(point);
			document.dispatchEvent(
			  new CustomEvent("loadedLazyOeModule", {
				detail: {module_id: () => module_id},
			  })
			);
		  })
		  .catch(error => console.log(error));
		observer.unobserve(point);
	  }
	});
  }, lazyOeOptions);

  lazyOeModules.forEach(point => {
	moduleLazyOeObserver.observe(point);
  });
</script>
';

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

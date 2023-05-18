document.addEventListener("loadedLazyOeModule", (e) => oeTabFeatures(e.detail.module_id));

var loadedModules = document.querySelectorAll('.has-dynamic-tabs[data-oe-module-id]');
loadedModules.forEach(function (module) {
	oeTabFeatures(module.getAttribute('data-oe-module-id'));
});

function oeTabFeatures(module_id) {
	let tabs = document.querySelectorAll('.has-dynamic-tabs[data-oe-module-id="' + module_id + '"] a[data-bs-toggle="tab"]');
	tabs.forEach(function (tab) {
		tab.addEventListener('shown.bs.tab', function (e) {
			let el = document.querySelector(e.target.hash);
			let url = e.target.getAttribute('data-oe-load-tab');
			if (el && url) {
				el.innerHTML = '<div class="spinner-grow" role="status"><span class="visually-hidden">Loading...</span></div>';
				fetch(url)
					.then(response => {
						if (!response.ok) {
							throw new Error('Network error' + response.status);
						}
						return response.text();
					})
					.then(data => {
						el.innerHTML = data;
					})
					.catch(error => console.log(error))
					.finally(() => {
						el.removeAttribute('data-oe-load-tab');
					});
			}
		}, {once: true})
	})
}

document.addEventListener('click', function (e) {
	if (e.target.getAttribute('data-oe-load-more')) {
		let el = e.target.closest('.active').querySelector('[data-oe-load-more-here]');
		let url = e.target.getAttribute('data-oe-load-more');
		let btnWrapper = e.target.closest('[data-oe-load-more-button-wrapper]');
		$(btnWrapper.querySelectorAll('button')).button('loading');
		if (el && url) {
			fetch(url)
				.then(response => {
					if (!response.ok) {
						throw new Error('Network error' + response.status);
					}
					return response.text();
				})
				.then(data => {
					el.insertAdjacentHTML('beforeend', data);
				})
				.catch(error => console.log(error))
				.finally(() => {
					btnWrapper.parentNode.removeChild(btnWrapper);
				});
		}
	}
});

document.addEventListener("loadedLazyOeModule", (e) => oeTabFeatures(e.detail.module_id()));

var loadedModules = document.querySelectorAll('.has-dynamic-tabs[data-oe-module-id]');
loadedModules.forEach(function (module) {
	oeTabFeatures(module.getAttribute('data-oe-module-id'));
});

function oeTabFeatures(module_id) {
	let tabs = document.querySelectorAll('.has-dynamic-tabs[data-oe-module-id="' + module_id + '"] a[data-bs-toggle="tab"]');
	tabs.forEach(function (tab) {
		tab.addEventListener('shown.bs.tab', function (e) {
			const el = document.querySelector(e.target.hash);
			const url = e.target.getAttribute('data-oe-load-tab');
			if (el && url) {
				fetch(url)
					.then(function(response) {
						if (!response.ok) {
							throw new Error('Network error');
					}
						return response.text();
					})
					.then(data => {
						el.innerHTML = data;
					})
					.finally(() => {
						el.removeAttribute('data-oe-load-tab');
				});
			}
		}, {once: true})
	})
}

document.addEventListener('click', function(e) {
	if (e.target.getAttribute('data-oe-load-more')) {
		const el = e.target.closest('.active').querySelector('[data-oe-load-more-here]');
		const url = e.target.getAttribute('data-oe-load-more');
		const btnWrapper = e.target.closest('[data-oe-load-more-button-wrapper]');
		btnWrapper.parentNode.removeChild(btnWrapper);
		if (el && url) {
			fetch(url)
				.then(function(response) {
					if (!response.ok) {
						throw new Error('Network error');
					}
					return response.text();
				})
				.then(function(data) {
					el.insertAdjacentHTML('beforeend', data);
				})
				.catch(function(error) {
					console.error('Error:', error);
			});
}
	}
});

document.addEventListener("loadedLazyOeModule", (e) => oeTabFeatures(e.detail.module_id()));

const loadedModules = document.querySelectorAll('[data-oe-module-id]');
loadedModules.forEach(function (module) {
	oeTabFeatures($(module).attr('data-oe-module-id'));
})

function oeTabFeatures(module_id) {
	let tabs = document.querySelectorAll('[data-oe-module-id="' + module_id + '"] a[data-bs-toggle="tab"]');
	tabs.forEach(function (tab) {
		tab.addEventListener('shown.bs.tab', function (e) {
			let el = $(e.target.hash).find('[data-oe-load-tab]');
			let btnWrapper = el.siblings('.oe-load-more-link');
			let url = el.attr('data-oe-load-tab');
			if (el.length) {
				$.get(url, function (data) {
					el.html(data);
				}).fail(function () {
					btnWrapper.remove();
				}).always(function () {
					el.removeAttr('data-oe-load-tab');
					let divCount = el.children('div').length;
					let btnLimit = btnWrapper.attr('data-oe-load-limit');
					if (divCount < btnLimit) {
						btnWrapper.remove();
					}
					btnWrapper.removeClass('d-none');
				});
			}
		}, {once: true})
	})

	let loadButtons = document.querySelectorAll('[data-oe-module-id="' + module_id + '"] [data-oe-load-more]')
	loadButtons.forEach(function (loadButton) {
		loadButton.addEventListener('click', function (e) {
			let btnWrapper = $(e.target).closest('.oe-load-more-link');
			let url = $(e.target).attr('data-oe-load-more');
			$.get(url, function (data) {
			}).done(function (data) {
				$(data).appendTo(btnWrapper.siblings('.oe-load-more-row'));
			}).always(function () {
				btnWrapper.remove();
			});
		}, {once: true})
	})
}

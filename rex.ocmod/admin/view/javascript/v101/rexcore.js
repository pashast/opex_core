function addMlJsItemHTML(lang, id, html, instance = '') {
	$('.tab-pane#language' + lang + '-multi' + instance + ' .adder').append(html);
	sortPanels();

	const sideTabs = $('#mljs-cards' + instance + ' #language' + lang + '-multi' + instance + ' .nav-pills[role="tablist"]');
	if (sideTabs.length) {
		sideTabs.append('<div class="d-flex align-items-center justify-content-between nav-link" id="mljs-card' + instance + '-' + lang + '-' + id + '-tab" data-bs-toggle="pill" data-bs-target="#mljs-card' + instance + '-' + lang + '-' + id + '" role="tab">' +
			'<span><i class="fas fa-arrows-alt-v"></i> <span class="tab-name">' + id + '</span></span>' +
			'</div>');
		navTabs('#mljs-cards' + instance);
		$('#mljs-card' + instance + '-' + lang + '-' + id + '-tab').click();
	}

	fireAutocomplete();
	addAutoheadingClass();
	$('#mljs-card' + instance + '-' + lang + '-' + id + ' textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
}

function addJsItemHTML(id, html, instance = '') {
	$('#js-cards' + instance + ' .adder').append(html);
	sortPanels();

	const sideTabs = $('#js-cards' + instance + ' .nav-pills[role="tablist"]');
	if (sideTabs.length) {
		sideTabs.append('<div class="d-flex align-items-center justify-content-between nav-link" id="js-card' + instance + '-' + id + '-tab" data-bs-toggle="pill" data-bs-target="#js-card' + instance + '-' + id + '" role="tab">' +
			'<span><i class="fas fa-arrows-alt-v"></i> <span class="tab-name">' + id + '</span></span>' +
			'</div>');
		navTabs('#js-cards' + instance);
		$('#js-card-' + id + instance + '-tab').click();
	}

	fireAutocomplete();
	addAutoheadingClass();
	$('#js-card' + instance + '-' + id + ' textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
}

function cardRemove(block, id) {
	let confirmed = true;
	if (typeof rex_confirm !== 'undefined' && rex_confirm) {
		confirmed = confirm(rex_confirm);
	}
	if (confirmed) {
		$('#' + block + '-' + id).remove();

		const sideTab = $('#' + block + '-' + id + '-tab');
		if (sideTab.length) {
			if (sideTab.prev('.nav-link').length > 0) {
				sideTab.prev('.nav-link').tab('show');
			} else if (sideTab.next('.nav-link').length > 0) {
				sideTab.next('.nav-link').tab('show');
			}
			sideTab.remove();
		}
	}
}

function sortPanels() {
	$('.sort-items').sortable({
		animation: 150,
		ghostClass: 'bg-info',
		draggable: '.card',
		handle: '.sort-btn',
		onStart: function (e) {
			var ids_textarea = [];
			$(e.item).find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
				ids_textarea.push($(this).attr("id"))
			});
			ids_textarea.forEach(function (item, i, ids_textarea) {
				CKEDITOR.instances[item].destroy();
			});
		},
		onEnd: function (e) {
			var ids_textarea = [];
			$(e.item).find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
				ids_textarea.push($(this).attr("id"))
			});
			ids_textarea.forEach(function (item, i, ids_textarea) {
				CKEDITOR.replace(item);
			});
		}
	});
}

function navTabs(el) {
	const tabList = $(el).find('.nav-pills[role="tablist"]');

	if (!tabList.length) {
		return;
	}

	tabList.on('click', 'div', function (e) {
		e.preventDefault();
		$(this).tab('show');
	})

	var dragstart_i;
	tabList.sortable({
		animation: 150,
		ghostClass: 'border',
		draggable: '.nav-link',
		onStart: function (e) {
			dragstart_i = $(e.item).index();
			let id = $(e.item).data('bs-target');
			let ids_textarea = [];
			$(id).find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
				ids_textarea.push($(this).attr("id"))
			});
			ids_textarea.forEach(function (item, i, ids_textarea) {
				CKEDITOR.instances[item].destroy();
			});
		},
		onEnd: function (e) {
			let i = $(e.item).index();
			let id = $(e.item).data('bs-target');
			if (dragstart_i > i) {
				$(id).insertBefore($(id).parent().find('.tab-pane').eq(i));
			} else {
				$(id).insertAfter($(id).parent().find('.tab-pane').eq(i));
			}
			let ids_textarea = [];
			$(id).find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
				ids_textarea.push($(this).attr("id"))
			});
			ids_textarea.forEach(function (item, i, ids_textarea) {
				CKEDITOR.replace(item);
			});
		}
	});
}

function autocompleteTypes(path) {
	var param_value, param_label;
	switch (path) {
		//Стандартні автокомліти опенкарт
		case 'catalog/product.autocomplete':
			param_value = 'product_id';
			param_label = 'name';
			break;
		case 'catalog/category.autocomplete':
			param_value = 'category_id';
			param_label = 'name';
			break;
		case 'catalog/manufacturer.autocomplete':
			param_value = 'manufacturer_id';
			param_label = 'name';
			break;
		case 'catalog/option.autocomplete':
			param_value = 'option_id';
			param_label = 'name';
			break;
		case 'catalog/attribute.autocomplete':
			param_value = 'attribute_id';
			param_label = 'name';
			break;
		//Кастомний автокомліт
		default:
			param_value = 'param_value'; //ID
			param_label = 'param_label'; //Назва
			break;
	}
	return [param_value, param_label];
}

function fireAutocomplete() {
	$('input.item-autocomplete').autocomplete({
		'source': function (request, response) {
			var limit = 5
			if (typeof rex_ac_limit !== 'undefined') {
				limit = rex_ac_limit;
			}
			$.ajax({
				url: 'index.php?route=' + $(this).data('path') + '&user_token=' + user_token + '&limit=' + limit + '&filter_name=' + encodeURIComponent(request),
				dataType: 'json',
				success: function (json) {
					var path = $(document.activeElement).data('path').split('&');
					var types = autocompleteTypes(path[0]);

					response($.map(json, function (item) {
						return {
							value: item[types[0]],
							label: item[types[1]],
						}
					}));
				}
			});
		},
		'select': function (item) {
			$(this).val('');
			let table = $(this).siblings('.form-control').find('table');
			createAcItem($(this), table, item);
		}
	});
	sortAutocompleteItems();
	if (typeof fontello_link == 'undefined' || !fontello_link) {
		$('.fontello-btn').remove();
	}
}

function createAcItem(input, table, item) {
	var field = table.data('id');
	var html = '';

	if (input.data('one') === 1) {
		table.find('tbody').html('');
		html += '<tr data-id="' + field + '-' + item['value'] + '">';
		html += '  <td>' + item['label'] + '<input type="hidden" name="' + field + '" value="' + item['value'] + '"/></td>';
		html += '  <td class="text-end"><button type="button" class="btn btn-danger btn-sm rex-remove-item"><i class="fas fa-minus-circle"></i></button></td>';
		html += '</tr>';
		table.append(html);
	} else {
		$('#' + field + '-' + item['value']).remove();
		$('[data-id="' + field + '-' + item['value'] + '"]').remove();
		html += '<tr data-id="' + field + '-' + item['value'] + '">';
		html += '  <td class="w-100"><i class="fas fa-arrows-alt-v"></i> ' + item['label'] + '<input type="hidden" name="' + field + '[]" value="' + item['value'] + '"/></td>';
		html += '  <td class="text-end"><button type="button" class="btn btn-danger btn-sm rex-remove-item"><i class="fas fa-minus-circle"></i></button></td>';
		html += '</tr>';
		table.append(html);
	}

	$(table).trigger('acItemSelected', [item['value'], item['label']]);
	sortAutocompleteItems();
}

function removeAcItem(table, val) {
	var tr = table.find('[value="' + val + '"]').closest('tr');
	table.trigger('acItemRemoved', [val, tr.text().trim()]);
	tr.remove();

	popAutoheadingText(table.closest('.row-autoheading'));
}

function sortAutocompleteItems() {
	$('.item-well').sortable({
		animation: 150,
		ghostClass: 'bg-info'
	});
}

function addAutoheadingClass() {
	$('.card-name').each(function () {
		var panel = $(this).closest('.card-header').next('.card-body');
		var id = $(this).data('rex-ah-row');
		var el = $(panel).find('.row').eq(id).addClass('row-autoheading');

		popAutoheadingText(el);
	});
}

function popAutoheadingText(el) {
	let card = el.closest('.card-body').parent('.card');
	let id = $(card).attr('id');
	let text = false;

	let textEl = el.find('input:first');
	if ($(textEl).data('path')) {
		text = el.find('td:first').text();
	} else {
		text = textEl.val();
	}

	if (!text || text === '') {
		text = card.closest('.sort-items').data('tab-name');
	}

	$('[data-bs-target="#' + id + '"]').find('.tab-name').text(text);
	card.find('.card-name').text(text);
}

function getAllElements(el) {
	var table = el.prev('table');
	var checked = [];
	$(table).find('[type="hidden"]').each(function (index) {
		checked.push(String($(this).val()));
	});

	var input = table.parent().siblings('[data-path]');
	var path = input.data('path');
	var name = encodeURIComponent(input.val());
	var full_limit = 1000
	if (typeof rex_ac_full_limit !== 'undefined') {
		full_limit = rex_ac_full_limit;
	}
	$.ajax({
		url: 'index.php?route=' + path + '&limit=' + full_limit + '&user_token=' + user_token + '&filter_name=' + name,
		complete: function () {
			$('#modal-elements [data-loader]').remove();
		},
		dataType: 'json',
		success: function (json) {
			path = path.split('&');
			var types = autocompleteTypes(path[0]);

			$.map(json, function (item) {
				return {
					value: item[types[0]],
					label: item[types[1]],
				}
			});

			var html = '';
			$.each(json, function (index, value) {

				let is_checked;
				if (checked.includes(String(value[types[0]]))) {
					is_checked = 'checked';
				}
				let input_type = 'type="checkbox" name="fd-checkbox[]"';
				if (input.data('one') === 1) {
					input_type = 'type="radio" name="fd-radio"';
				}
				html += '<div class="form-check">';
				html += '  <input class="form-check-input"  ' + input_type + is_checked + ' value="' + value[types[0]] + '" id="fd-' + value[types[0]] + '">';
				html += '  <label class="form-check-label" for="fd-' + value[types[0]] + '">' + value[types[1]] + '</label>';
				html += '</div>';
			})
			$('#modal-elements-items').html(html);
		}
	});
}

$(document)
	.on('click', '.rex-remove-color', function () {
		$(this).removeClass('rex-remove-color').addClass('rex-add-color');
		$(this).find('i').removeClass('fa-circle-xmark').addClass('fa-eye-dropper');
		$(this).next('input').attr('type', 'text').removeClass('form-control-color w-100');
	})
	.on('click', '.rex-add-color', function () {
		$(this).removeClass('rex-add-color').addClass('rex-remove-color');
		$(this).find('i').removeClass('fa-eye-dropper').addClass('fa-circle-xmark');
		$(this).next('input').attr('type', 'color').addClass('form-control-color w-100');
	})
	.on('click', '.rex-remove-item', function () {
		let val = $(this).closest('tr').find('[type="hidden"]').val();
		let table = $(this).closest('table');

		removeAcItem(table, val);
	})
	.on('change', '[name="fd-checkbox[]"], [name="fd-radio"]', function () {
		let el = $(this);
		let table = $('.active[data-rex-all-el]').prev('table');
		let input = table.parent().siblings('[data-path]');
		let item = {
			value: el.val(),
			label: el.siblings('label').text(),
		}
		if (el.is(':checked')) {
			createAcItem(input, table, item);
		} else {
			removeAcItem(table, el.val())
		}
	})
	.on('keyup', '#rex-all-input', function () {
		let value = $(this).val();
		let button = $('.active[data-rex-all-el]');
		let table = button.prev('table');
		let input = table.parent().siblings('[data-path]');
		input.val(value);
		getAllElements(button);
	})
	.on('change', '.row-autoheading', function () {
		popAutoheadingText($(this));
	})
	.on('click', '[data-rex-all-el]', function (e) {
		e.preventDefault();
		let mobile = $('header #button-menu').is(':visible');
		$(this).addClass('active');
		let parent = $(this).closest('.form-control').parent();
		let t = parent.find('[data-path]').val();
		let h = parent.prev('label').text();
		$('#modal-elements').remove();
		html = '  <div class="modal-dialog modal-fullscreen">';
		html += '    <div class="modal-content">';
		html += '    <div data-loader class="d-flex justify-content-center align-items-center position-absolute top-0 left-0 w-100 h-100 bg-light" style="z-index: 1090;">' +
			'<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span>' +
			'</div>' +
			'</div>';
		html += '      <div class="modal-header">';
		html += '        <h5>' + h + '</h5> <input type="text" class="form-control mx-2" id="rex-all-input" value="' + t + '" style="width: 260px">';
		html += '        <button type="button" class="btn-close me-2" data-bs-dismiss="modal"></button>';
		html += '      </div>';
		if (mobile) {
			html += '      <div class="modal-body">' +
				'<div id="modal-elements-items"></div>' +
				'</div>';
		} else {
			html += '      <div class="modal-body">' +
				'<div style="margin-top: -8px;">' +
				'<input type="range" class="form-range" value="3" min="1" max="6" id="modal-elements-range"></div>' +
				'<div style="columns: 3" id="modal-elements-items"></div>' +
				'</div>';
		}
		html += '    </div>';
		html += '  </div>';
		$('body').append('<div id="modal-elements" class="modal">' + html + '</div>');
		$('#modal-elements').modal('show');
	})
	.on('change', '#modal-elements-range', function () {
		$('#modal-elements-items').css('columns', $(this).val());
	})
	.on('shown.bs.modal', '#modal-elements', function () {
		getAllElements($('.active[data-rex-all-el]'));
	})
	.on('hide.bs.modal', '#modal-elements', function () {
		$('.active[data-rex-all-el]').removeClass('active');
	})
	.on('click', '.fontello-btn', function (e) {
		e.preventDefault();
		$(this).addClass('active');
		$('#modal-fontello').remove();
		html = '  <div class="modal-dialog modal-xl">';
		html += '    <div class="modal-content">';
		html += '      <div class="modal-header">';
		html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" ></button>';
		html += '      </div>';
		html += '      <div class="modal-body"><iframe style="width: 100%; height: 600px" id="fontello-iframe" src="' + fontello_link + '"></iframe></div>';
		html += '    </div>';
		html += '  </div>';
		$('body').append('<div id="modal-fontello" class="modal">' + html + '</div>');
		$('#modal-fontello').modal('show');
	})
	.on('shown.bs.modal', '#modal-fontello', function () {
		$('#fontello-iframe').on('load', function () {
			var iframe = $('#fontello-iframe').contents();
			iframe.find(".i-name").click(function () {
				$('.fontello-btn.active').removeClass('active').prev('input').val($(this).text());
				$('#modal-fontello').modal('hide');
			});
		});
	})
	.on('hide.bs.modal', '#modal-fontello', function () {
		$('.fontello-btn.active').removeClass('active');
	})
	.ready(function () {
		sortPanels();

		$('[id^="js-cards"]').each(function (el) {
			navTabs(this);
		})

		$('[id^="mljs-cards"]').each(function (el) {
			navTabs(this);
		})

		fireAutocomplete();
		addAutoheadingClass();
		if ($('[data-oc-toggle=\'ckeditor\']').length) {
			$('textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
		}
	})
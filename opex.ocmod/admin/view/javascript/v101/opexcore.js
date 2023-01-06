function addMlJsItemHTML(lang, id) {
    $('.tab-pane#language' + lang + '-multi .adder').append(html);
    sortPanels();
    if (typeof opex_mljs_tabs !== 'undefined' && opex_mljs_tabs) {
        $('#mljs-cards #language' + lang + '-multi .nav-pills[role="tablist"]').append('<div class="d-flex align-items-center justify-content-between nav-link" id="mljs-card-' + lang + '-' + id + '-tab" data-bs-toggle="pill" data-bs-target="#mljs-card-' + lang + '-' + id + '" role="tab"><span><i class="fas fa-arrows-alt-v"></i> <span class="tab-name">' + id + '</span></span></div>');
        navTabs('#mljs-cards');
        $('#mljs-card-' + lang + '-' + id + '-tab').click();
    }
    fireAutocomplete();
    addAutoheadingClass();
    $('#mljs-card-' + lang + '-' + id + ' textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
}

function addJsItemHTML(id) {
    $('#js-cards .adder').append(html);
    sortPanels();
    if (typeof opex_js_tabs !== 'undefined' && opex_js_tabs) {
        $('#js-cards .nav-pills[role="tablist"]').append('<div class="d-flex align-items-center justify-content-between nav-link" id="js-card-' + id + '-tab" data-bs-toggle="pill" data-bs-target="#js-card-' + id + '" role="tab"><span><i class="fas fa-arrows-alt-v"></i> <span class="tab-name">' + id + '</span></span></div>');
        navTabs('#js-cards');
        $('#js-card-' + id + '-tab').click();
    }
    fireAutocomplete();
    addAutoheadingClass();
    $('#js-card-' + id + ' textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
}

function cardRemove(block, id) {
    var confirmed = true;
    if (typeof opex_confirm !== 'undefined' && opex_confirm) {
        confirmed = confirm(opex_confirm);
    }
    if (confirmed) {
        $('#' + block + '-' + id).remove();
        if (typeof opex_mljs_tabs !== 'undefined' && opex_mljs_tabs || typeof opex_js_tabs !== 'undefined' && opex_js_tabs) {
            var tab = $('#' + block + '-' + id + '-tab');
            if (tab.prev('.nav-link').length > 0) {
                tab.prev('.nav-link').tab('show');
            } else if (tab.next('.nav-link').length > 0) {
                tab.next('.nav-link').tab('show');
            }
        }
        tab.remove();
    }
}

function sortPanels() {
    $('.sort-wrap').sortable({
        forcePlaceholderSize: true,
        items: '.card',
        handle: '.sort-btn',
        start: function (event, ui) {
            var ids_textarea = [];
            ui.item.find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function (item, i, ids_textarea) {
                CKEDITOR.instances[item].destroy();
            });
        },
        stop: function (event, ui) {
            var ids_textarea = [];
            ui.item.find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function (item, i, ids_textarea) {
                CKEDITOR.replace(item);
            });
        }
    });
}

function navTabs(el) {
    $(el).find('#js-cards .nav-pills[role="tablist"]').on('click', 'div', function (e) {
        e.preventDefault();
        $(this).tab('show');
    })

    var dragstart_i;
    $(el).find('.nav-pills[role="tablist"]').sortable({
        forcePlaceholderSize: true,
        items: '.nav-link',
        start: function (e, ui) {
            dragstart_i = $(ui.item[0]).index();
            var id = $(ui.item[0]).data('bs-target');
            var ids_textarea = [];
            $(id).find("textarea[data-oc-toggle=\'ckeditor\']").each(function () {
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function (item, i, ids_textarea) {
                CKEDITOR.instances[item].destroy();
            });
        },
        stop: function (e, ui) {
            var i = $(ui.item[0]).index();
            var id = $(ui.item[0]).data('bs-target');
            if (dragstart_i > i) {
                $(id).insertBefore($(id).parent().find('.tab-pane').eq(i));
            } else {
                $(id).insertAfter($(id).parent().find('.tab-pane').eq(i));
            }
            var ids_textarea = [];
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
            if (typeof opex_ac_limit !== 'undefined') {
                limit = opex_ac_limit;
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
}

function createAcItem(input, table, item) {
    var field = table.data('id');
    var html = '';

    if (input.data('one') === 1) {
        table.find('tbody').html('');
        html += '<tr data-id="' + field + '-' + item['value'] + '">';
        html += '  <td>' + item['label'] + '<input type="hidden" name="' + field + '" value="' + item['value'] + '"/></td>';
        html += '  <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-item"><i class="fas fa-minus-circle"></i></button></td>';
        html += '</tr>';
        table.append(html);
    } else {
        $('#' + field + '-' + item['value']).remove();
        $('[data-id="' + field + '-' + item['value'] + '"]').remove();
        html += '<tr data-id="' + field + '-' + item['value'] + '">';
        html += '  <td class="w-100"><i class="fas fa-arrows-alt-v"></i> ' + item['label'] + '<input type="hidden" name="' + field + '[]" value="' + item['value'] + '"/></td>';
        html += '  <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-item"><i class="fas fa-minus-circle"></i></button></td>';
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
        forcePlaceholderSize: true,
    });
}

function addAutoheadingClass() {
    $('.card-name').each(function () {
        var panel = $(this).closest('.card-header').next('.card-body');
        var id = $(this).data('row');
        var el = $(panel).find('.row').eq(id).addClass('row-autoheading');

        popAutoheadingText(el);
    });
}

function popAutoheadingText(el) {
    var card = el.closest('.card-body').parent('.card');
    var jsid = $(card).data('jsid');
    var mljsid = $(card).data('mljsid');
    var mllang = $(card).data('mllang');

    var textEl = el.find('input:first');
    if ($(textEl).data('path')) {
        text = el.find('td:first').text();
    } else {
        text = textEl.val();
    }

    if (typeof jsid !== 'undefined') {
        if (typeof opex_js_tabs !== 'undefined' && text === '') {
            text = opex_js_tabs + ' ' + jsid;
        }
        $('#js-card-' + jsid + '-tab').find('.tab-name').text(text);
        $('#js-card-' + jsid).find('.card-name').text(text);
    }
    if (typeof mljsid !== 'undefined' && typeof mllang !== 'undefined') {
        if (typeof opex_mljs_tabs !== 'undefined' && text === '') {
            text = opex_mljs_tabs + ' ' + mljsid;
        }
        $('#mljs-card-' + mllang + '-' + mljsid + '-tab').find('.tab-name').text(text);
        $('#mljs-card-' + mllang + '-' + mljsid).find('.card-name').text(text);
    }
}

function getAllElements(el) {
    var table = el.prev('table');
    var checked = [];
    $(table).find('[type="hidden"]').each(function (index) {
        checked.push($(this).val());
    });
    var input = table.parent().siblings('[data-path]');
    var path = input.data('path');
    var name = encodeURIComponent(input.val());
    var full_limit = 1000
    if (typeof opex_ac_full_limit !== 'undefined') {
        full_limit = opex_ac_full_limit;
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
                if (checked.includes(value[types[0]])) {
                    is_checked = 'checked';
                }
                let input_type = 'type="checkbox" name="fd-chekbox[]"';
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
    .on('click', '.btn-remove-item', function () {
        let val = $(this).closest('tr').find('[type="hidden"]').val();
        let table = $(this).closest('table');

        removeAcItem(table, val);
    })
    .on('change', '[name="fd-chekbox[]"], [name="fd-radio"]', function () {
        let el = $(this);
        let table = $('.active[data-all-el]').prev('table');
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
    .on('change', '.row-autoheading', function () {
        popAutoheadingText($(this));
    })
    .on('click', '[data-all-el]', function (e) {
        e.preventDefault();
        $(this).addClass('active');
        var h = $(this).closest('.form-control').parent().prev('label').text();
        $('#modal-elements').remove();
        html = '  <div class="modal-dialog modal-xl">';
        html += '    <div class="modal-content">';
        html += '    <div data-loader class="d-flex justify-content-center align-items-center position-absolute top-0 left-0 w-100 h-100 bg-light" style="z-index: 1090;">' +
            '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span>' +
            '</div>' +
            '</div>';
        html += '      <div class="modal-header">';
        html += '        <h5>' + h + '</h5>';
        html += '        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>';
        html += '      </div>';
        html += '      <div class="modal-body">' +
            '<div class="position-absolute px-3 py-0 end-0 start-0" style="margin-top: -28px;">' +
            '<input type="range" class="form-range" value="2" min="1" max="5" id="modal-elements-range"></div>' +
            '<div style="columns: 2" id="modal-elements-items"></div>' +
            '</div>';
        html += '    </div>';
        html += '  </div>';
        $('body').append('<div id="modal-elements" class="modal">' + html + '</div>');
        $('#modal-elements').modal('show');
    })
    .on('change', '#modal-elements-range', function () {
        $('#modal-elements-items').css('columns', $(this).val());
    })
    .on('shown.bs.modal', '#modal-elements', function () {
        getAllElements($('.active[data-all-el]'));
    })
    .on('hide.bs.modal', '#modal-elements', function () {
        $('.active[data-all-el]').removeClass('active');
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
        if (typeof opex_js_tabs !== 'undefined' && opex_js_tabs) {
            navTabs('#js-cards');
        }
        if (typeof opex_mljs_tabs !== 'undefined' && opex_mljs_tabs) {
            navTabs('#mljs-cards');
        }
        fireAutocomplete();
        addAutoheadingClass();
        $('textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
    })
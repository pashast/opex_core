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
            ui.item.find("textarea[data-oc-toggle=\'ckeditor\']").each(function (){
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function(item, i, ids_textarea) {
                CKEDITOR.instances[item].destroy();
            });
        },
        stop: function (event, ui) {
            var ids_textarea = [];
            ui.item.find("textarea[data-oc-toggle=\'ckeditor\']").each(function (){
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function(item, i, ids_textarea) {
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
            $(id).find("textarea[data-oc-toggle=\'ckeditor\']").each(function (){
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function(item, i, ids_textarea) {
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
            $(id).find("textarea[data-oc-toggle=\'ckeditor\']").each(function (){
                ids_textarea.push($(this).attr("id"))
            });
            ids_textarea.forEach(function(item, i, ids_textarea) {
                CKEDITOR.replace(item);
            });
        }
    });
}

function fireAutocomplete() {
    $('input.item-autocomplete').autocomplete({
        'source': function (request, response) {
            $.ajax({
                url: 'index.php?route=' + $(this).data('path') + '&user_token=' + user_token + '&limit=' + autocomplete_limit + '&filter_name=' + encodeURIComponent(request),
                dataType: 'json',
                success: function (json) {
                    var param_label, param_value;
                    var path = $(document.activeElement).data('path');

                    switch (path) {
                        case 'catalog/product|autocomplete':
                            param_value = 'product_id';
                            param_label = 'name';
                            break;
                        case 'catalog/category|autocomplete':
                            param_value = 'category_id';
                            param_label = 'name';
                            break;
                        case 'catalog/manufacturer|autocomplete':
                            param_value = 'manufacturer_id';
                            param_label = 'name';
                            break;
                        case 'catalog/option|autocomplete':
                            param_value = 'option_id';
                            param_label = 'name';
                            break;
                        case 'catalog/attribute|autocomplete':
                            param_value = 'attribute_id';
                            param_label = 'name';
                            break;
                        default:
                            param_value = 'param_value';
                            param_label = 'param_label';
                            break;
                    }
                    response($.map(json, function (item) {
                        return {
                            label: item[param_label],
                            value: item[param_value]
                        }
                    }));
                }
            });
        },
        'select': function (item) {
            $(this).val('');

            var el = $(this).siblings('.form-control').find('table');
            var field = el.data('id');
            var html = '';

            if ($(this).data('one') === 1) {
                el.find('tbody').html('');
                html += '<tr data-id="' + field + '-' + item['value'] + '">';
                html += '  <td>' + item['label'] + '<input type="hidden" name="' + field + '" value="' + item['value'] + '"/></td>';
                html += '  <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-item"><i class="fas fa-minus-circle"></i></button></td>';
                html += '</tr>';
                el.append(html);
            } else {
                $('#' + field + '-' + item['value']).remove();
                $('[data-id="' + field + '-' + item['value'] + '"]').remove();
                html += '<tr data-id="' + field + '-' + item['value'] + '">';
                html += '  <td class="w-100"><i class="fas fa-arrows-alt-v"></i> ' + item['label'] + '<input type="hidden" name="' + field + '[]" value="' + item['value'] + '"/></td>';
                html += '  <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-item"><i class="fas fa-minus-circle"></i></button></td>';
                html += '</tr>';
                el.append(html);
            }
            sortAutocompleteItems();
        }
    });
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

$(document)
    .on('click', '.btn-remove-item', function () {
        var parentAH = $(this).closest('.row-autoheading');
        $(this).closest('tr').remove();
        popAutoheadingText(parentAH);
    })
    .on('change', '.row-autoheading', function () {
        popAutoheadingText($(this));
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
        sortAutocompleteItems();
        addAutoheadingClass();
        $('textarea[data-oc-toggle=\'ckeditor\']').ckeditor();
    })
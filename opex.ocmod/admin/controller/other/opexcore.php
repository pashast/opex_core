<?php
namespace Opencart\Admin\Controller\Extension\Opex\Other;
class Opexcore extends \Opencart\System\Engine\Controller {

    public function index(): void {
        $this->load->language('extension/opex/other/opexcore');

        $this->document->setTitle($this->language->get('heading_title'));

        $data['breadcrumbs'] = [];

        $data['breadcrumbs'][] = [
            'text' => $this->language->get('text_home'),
            'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'])
        ];

        $data['breadcrumbs'][] = [
            'text' => $this->language->get('text_extension'),
            'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=other')
        ];

        $data['breadcrumbs'][] = [
            'text' => $this->language->get('heading_title'),
            'href' => $this->url->link('extension/opex/other/opexcore', 'user_token=' . $this->session->data['user_token'])
        ];

        $data['save'] = $this->url->link('extension/opex/other/opexcore|save', 'user_token=' . $this->session->data['user_token']);
        $data['back'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=other');

        $data['other_opexcore_status'] = $this->config->get('other_opexcore_status');

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/opex/other/opexcore', $data));
    }

    public function save(): void {
        $this->load->language('extension/opex/other/opexcore');

        $json = [];

        if (!$this->user->hasPermission('modify', 'extension/opex/other/opexcore')) {
            $json['error'] = $this->language->get('error_permission');
        }

        if (!$json) {
            $this->load->model('setting/setting');

            $this->model_setting_setting->editSetting('other_opex', $this->request->post);

            $json['success'] = $this->language->get('text_success');
        }

        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode($json));
    }

    public function specialFields(array $data): bool|array {
        return $this->proceedFields($data['type'], $data['var']);
    }

    public function MlFields(array $data): array {
        foreach ($data['input'] as $language_id => $value) {
            foreach ($value as $item => $field) {
                if (array_key_exists($item, $data['fields'])) {
                    $data['input'][$language_id][$item] = $this->proceedFields($data['fields'][$item], $field);
                }
            }
        }

        return $data['input'];
    }

    public function MlJsAddFields(array $data): array {
        foreach ($data['input'] as $language_id => $value) {
            foreach ($value as $f => $fields) {
                foreach ($fields as $item => $field) {
                    if (array_key_exists($item, $data['fields'])) {
                        $data['input'][$language_id][$f][$item] = $this->proceedFields($data['fields'][$item], $field);
                    }
                }
            }
        }

        return $data['input'];
    }

    public function JsAddFields(array $data): array {
        foreach ($data['input'] as $key => $value) {
            foreach ($value as $item => $field) {
                if (array_key_exists($item, $data['fields'])) {
                    $data['input'][$key][$item] = $this->proceedFields($data['fields'][$item], $field);
                }
            }
        }

        $ml_output = [];

        if (!empty($data['input_ml'])){
            if (!empty($data['input'])) {
            	foreach ($data['input'] as $key => $value){
                	$ml_output[] = array_merge($data['input_ml'][$key], $value);
            	}
            } else {
                foreach ($data['input_ml'] as $key => $value) {
                    $ml_output[] = $data['input_ml'][$key];
                }
            }
        } else {
            $ml_output = $data['input'];
        }

        return $ml_output;
    }

    public function proceedFields(string $type, string|array $var): array {
        $response = [];

        switch ($type) { //TODO: Add all opencart standard autocompletes.
            case 'image':
                $this->load->model('tool/image');
                $response = [
                    'image' => is_file(DIR_IMAGE . $var) ? $var : '',
                    'thumb' => $this->model_tool_image->resize((is_file(DIR_IMAGE . $var) ? $var : 'no_image.png'), 190, 190)
                ];
                break;
            case 'ac_products':
                $this->load->model('catalog/product');
                if (!empty($var)) {
                    foreach ($var as $product_id) {
                        $product_info = $this->model_catalog_product->getProduct($product_id);
                        if ($product_info) {
                            $response[] = [
                                'param_label' => $product_info['name'],
                                'param_value' => $product_info['product_id']
                            ];
                        }
                    }
                }
                break;
            case 'ac_categories':
                $this->load->model('catalog/category');
                if (!empty($var)) {
                    foreach ($var as $category_id) {
                        $category_info = $this->model_catalog_category->getCategory($category_id);
                        if ($category_info) {
                            $response[] = [
                                'param_label' => ($category_info['path']) ? $category_info['path'] . ' &gt; ' . $category_info['name'] : $category_info['name'],
                                'param_value' => $category_info['category_id']
                            ];
                        }
                    }
                }
                break;
            case 'ac_manufacturers':
                $this->load->model('catalog/manufacturer');
                if (!empty($var)) {
                    foreach ($var as $manufacturer_id) {
                        $manufacturer_info = $this->model_catalog_manufacturer->getManufacturer($manufacturer_id);
                        if ($manufacturer_info) {
                            $response[] = [
                                'param_label' => $manufacturer_info['name'],
                                'param_value' => $manufacturer_info['manufacturer_id']
                            ];
                        }
                    }
                }
                break;
            case 'ac_informations':
                $this->load->model('catalog/information');
                if (!empty($var)) {
                    foreach ($var as $information_id) {
                        $information_info = $this->model_catalog_information->getDescriptions($information_id);
                        if ($information_info) {
                            $response[] = [
                                'param_label' => $information_info[(int)$this->config->get('config_language_id')]['title'],
                                'param_value' => $information_id
                            ];
                        }
                    }
                }
                break;
            case 'ac_options':
                $this->load->model('catalog/option');
                if (!empty($var)) {
                    foreach ($var as $option_id) {
                        $option_info = $this->model_catalog_option->getOption($option_id);
                        if ($option_info) {
                            $response[] = [
                                'param_label' => $option_info['name'],
                                'param_value' => $option_id
                            ];
                        }
                    }
                }
                break;
            case 'ac_attributes':
                $this->load->model('catalog/attribute');
                if (!empty($var)) {
                    foreach ($var as $attribute_id) {
                        $attribute_info = $this->model_catalog_attribute->getAttribute($attribute_id);
                        if ($attribute_info) {
                            $response[] = [
                                'param_label' => $attribute_info['name'],
                                'param_value' => $attribute_id
                            ];
                        }
                    }
                }
                break;
            case 'ac_product':
                $this->load->model('catalog/product');
                $product_info = $this->model_catalog_product->getProduct((int)$var);
                if ($product_info) {
                    $response = [
                        'param_label' => $product_info['name'],
                        'param_value' => $product_info['product_id']
                    ];
                }
                break;
            case 'ac_category':
                $this->load->model('catalog/category');
                $category_info = $this->model_catalog_category->getCategory((int)$var);
                if ($category_info) {
                    $response = [
                        'param_label' => ($category_info['path']) ? $category_info['path'] . ' &gt; ' . $category_info['name'] : $category_info['name'],
                        'param_value' => $category_info['category_id']
                    ];
                }
                break;
            case 'ac_manufacturer':
                $this->load->model('catalog/manufacturer');
                $manufacturer_info = $this->model_catalog_manufacturer->getManufacturer((int)$var);
                if ($manufacturer_info) {
                    $response = [
                        'param_label' => $manufacturer_info['name'],
                        'param_value' => $manufacturer_info['manufacturer_id']
                    ];
                }
                break;
            case 'ac_information':
                $this->load->model('catalog/information');
                $information_info = $this->model_catalog_information->getDescriptions((int)$var);
                if ($information_info) {
                    $response = [
                        'param_label' => $information_info[(int)$this->config->get('config_language_id')]['title'],
                        'param_value' => (int)$var
                    ];
                }
                break;
            case 'ac_option':
                $this->load->model('catalog/option');
                $option_info = $this->model_catalog_option->getOption((int)$var);
                if ($option_info) {
                    $response = [
                        'param_label' => $option_info['name'],
                        'param_value' => $option_info['option_id']
                    ];
                }
                break;
            case 'ac_attribute':
                $this->load->model('catalog/attribute');
                $attribute_info = $this->model_catalog_attribute->getAttribute((int)$var);
                if ($attribute_info) {
                    $response = [
                        'param_label' => $attribute_info['name'],
                        'param_value' => $attribute_info['attribute_id']
                    ];
                }
                break;
        }

        return $response;
    }

    public function autocompleteInformation(): void {
        $json = [];

        if (isset($this->request->get['filter_name'])) {
            $this->load->model('extension/opex/other/opexcore');

            $filter_data = [
                'filter_name' => $this->request->get['filter_name'],
                'start'       => 0,
                'limit'       => 5
            ];

            $results = $this->model_extension_opex_other_opexcore->getAutocompleteInformations($filter_data);

            foreach ($results as $result) {
                $json[] = [
                    'param_label' => strip_tags(html_entity_decode($result['title'], ENT_QUOTES, 'UTF-8')),
                    'param_value' => $result['information_id']
                ];
            }
        }

        $sort_order = [];

        foreach ($json as $key => $value) {
            $sort_order[$key] = $value['param_value'];
        }

        array_multisort($sort_order, SORT_ASC, $json);

        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode($json));
    }
}
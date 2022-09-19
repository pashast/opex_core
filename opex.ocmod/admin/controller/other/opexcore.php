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

        if ($this->config->get('other_opexcore_ac_limit')) {
            $data['other_opexcore_ac_limit'] = $this->config->get('other_opexcore_ac_limit');
        } else {
            $data['other_opexcore_ac_limit'] = 5;
        }

        $data['header']      = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer']      = $this->load->controller('common/footer');

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

        if (!empty($data['input_ml'])) {
            if (!empty($data['input'])) {
                foreach ($data['input'] as $key => $value) {
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

    public function proceedFields(string $func_name, string|array $var): array {
        $output = [];
        if ($var) {
            $separator = '|';
            if (is_string($var)) {
                $string_flag = true;
                $var         = [$var];
            }
            if (str_starts_with($func_name, $separator)) {
                $method_name = ltrim($func_name, $separator);
                $response    = $this->$method_name($var);
            } else {
                $response = $this->load->controller($func_name, $var);
            }
            if (isset($string_flag) && !empty($response)) {
                $output = $response[0];
            } else {
                $output = $response;
            }
        }
        return $output;
    }

    public function reverseImages($var): array {
        $this->load->model('tool/image');
        $response = [];

        foreach ($var as $image) {
            $response[] = [
                'image' => is_file(DIR_IMAGE . $image) ? $image : '',
                'thumb' => $this->model_tool_image->resize((is_file(DIR_IMAGE . $image) ? $image : 'no_image.png'), 190, 190)
            ];
        }
        return $response;
    }

    public function reverseAutocompleteProducts($var): array {
        $this->load->model('catalog/product');
        $response = [];

        foreach ($var as $product_id) {
            $product_info = $this->model_catalog_product->getProduct($product_id);
            if ($product_info) {
                $response[] = [
                    'param_value' => $product_info['product_id'],
                    'param_label' => $product_info['name']
                ];
            }
        }
        return $response;
    }

    public function reverseAutocompleteCategories($var): array {
        $this->load->model('catalog/category');
        $response = [];

        foreach ($var as $category_id) {
            $category_info = $this->model_catalog_category->getCategory($category_id);
            if ($category_info) {
                $response[] = [
                    'param_value' => $category_info['category_id'],
                    'param_label' => ($category_info['path']) ? $category_info['path'] . ' &gt; ' . $category_info['name'] : $category_info['name']
                ];
            }
        }
        return $response;
    }

    public function reverseAutocompleteManufacturers($var): array {
        $this->load->model('catalog/manufacturer');
        $response = [];

        foreach ($var as $manufacturer_id) {
            $manufacturer_info = $this->model_catalog_manufacturer->getManufacturer($manufacturer_id);
            if ($manufacturer_info) {
                $response[] = [
                    'param_value' => $manufacturer_info['manufacturer_id'],
                    'param_label' => $manufacturer_info['name']
                ];
            }
        }
        return $response;
    }

    public function reverseAutocompleteInformations($var): array {
        $this->load->model('catalog/information');
        $response = [];

        foreach ($var as $information_id) {
            $information_info = $this->model_catalog_information->getDescriptions($information_id);
            if ($information_info) {
                $response[] = [
                    'param_value' => $information_id,
                    'param_label' => $information_info[(int)$this->config->get('config_language_id')]['title']
                ];
            }
        }

        return $response;
    }

    public function reverseAutocompleteOptions($var): array {
        $this->load->model('catalog/option');
        $response = [];

        foreach ($var as $option_id) {
            $option_info = $this->model_catalog_option->getOption($option_id);
            if ($option_info) {
                $response[] = [
                    'param_value' => $option_id,
                    'param_label' => $option_info['name']
                ];
            }
        }
        return $response;
    }

    public function reverseAutocompleteAttributes($var): array {
        $this->load->model('catalog/attribute');
        $response = [];

        foreach ($var as $attribute_id) {
            $attribute_info = $this->model_catalog_attribute->getAttribute($attribute_id);
            if ($attribute_info) {
                $response[] = [
                    'param_value' => $attribute_id,
                    'param_label' => $attribute_info['name']
                ];
            }
        }
        return $response;
    }

    public function autocompleteInformation(): void {
        $json = [];

        if (isset($this->request->get['filter_name'])) {
            $this->load->model('extension/opex/other/opexcore');

            if (isset($this->request->get['limit'])) {
                $limit = (int)$this->request->get['limit'];
            } else {
                $limit = 5;
            }

            $filter_data = [
                'filter_name' => $this->request->get['filter_name'],
                'start' => 0,
                'limit' => $limit
            ];

            $results = $this->model_extension_opex_other_opexcore->getAutocompleteInformations($filter_data);

            foreach ($results as $result) {
                $json[] = [
                    'param_value' => $result['information_id'],
                    'param_label' => strip_tags(html_entity_decode($result['title'], ENT_QUOTES, 'UTF-8')),
                ];
            }
        }

        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode($json));
    }
}
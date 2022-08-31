<?php
namespace Opencart\Admin\Model\Extension\Opex\Other;
class Opexcore extends \Opencart\System\Engine\Model {
    public function MlFields($input, $ml_special_fields): array {
        $ml = $input;

        if(!empty($ml_special_fields) && is_array($ml)) {
            foreach ($ml as $language_id => $value) {
                foreach ($value as $item => $field) {
                    if (array_key_exists($item, $ml_special_fields)) {
                        $ml[$language_id][$item] = $this->proceedFields($ml_special_fields[$item], $field);
                    }
                }
            }
        }

		return $ml;
	}

	public function MlJsAddFields($input, $mljs_special_fields): array {
			$mljs = $input;

			if(!empty($mljs_special_fields) && is_array($mljs)) {
				foreach ($mljs as $language_id => $value) {
					foreach ($value as $f => $fields) {
						foreach ($fields as $item => $field) {
							if (array_key_exists($item, $mljs_special_fields)) {
								$mljs[$language_id][$f][$item] = $this->proceedFields($mljs_special_fields[$item], $field);
							}
						}
					}
				}
			}

		return $mljs;
	}

	public function JsAddFields($input, $input_ml, $js_special_fields): array {
        $js = $input;

        if(!empty($js_special_fields) && is_array($js)) {
            foreach ($js as $key => $value) {
                foreach ($value as $item => $field) {
                    if (array_key_exists($item, $js_special_fields)) {
                        $js[$key][$item] = $this->proceedFields($js_special_fields[$item], $field);
                    }
                }
            }
        }

        $js_ml = $input_ml;

		$ml_output = [];

		if (is_array($js) && is_array($js_ml)){
            foreach ($js as $key => $value){
                $ml_output[] = array_merge($js_ml[$key], $value);
            }
		}

		return $ml_output;
	}

    public function proceedFields($type, $var): mixed {
        $response = false;

        switch ($type) {
            case 'image':
                $this->load->model('tool/image');

                $response = array(
                    'image' => is_file(DIR_IMAGE . $var) ? $var : '',
                    'thumb' => $this->model_tool_image->resize((is_file(DIR_IMAGE . $var) ? $var : 'no_image.png'), 190, 190)
                );

                break;
            case 'ac_products':
                $this->load->model('catalog/product');
                $response = array();

                if (!empty($var)) {
                    $products = $var;
                } else {
                    $products = [];
                }

                foreach ($products as $product_id) {
                    $product_info = $this->model_catalog_product->getProduct($product_id);

                    if ($product_info) {
                        $response[] = [
                            'param_label'       => $product_info['name'],
                            'param_value'       => $product_info['product_id'],
                        ];
                    }
                }
                break;
            case 'ac_categories':
                $this->load->model('catalog/category');
                $response = array();

                if (!empty($var)) {
                    $categories = $var;
                } else {
                    $categories = [];
                }

                foreach ($categories as $category_id) {
                    $category_info = $this->model_catalog_category->getCategory($category_id);

                    if ($category_info) {
                        $response[] = [
                            'param_label'       => ($category_info['path']) ? $category_info['path'] . ' &gt; ' . $category_info['name'] : $category_info['name'],
                            'param_value'       => $category_info['category_id'],
                        ];
                    }
                }
                break;
            case 'ac_manufacturers':
                $this->load->model('catalog/manufacturer');
                $response = array();

                if (!empty($var)) {
                    $manufacturers = $var;
                } else {
                    $manufacturers = [];
                }

                foreach ($manufacturers as $manufacturer_id) {
                    $manufacturer_info = $this->model_catalog_manufacturer->getManufacturer($manufacturer_id);

                    if ($manufacturer_info) {
                        $response[] = [
                            'param_label'       => $manufacturer_info['name'],
                            'param_value'       => $manufacturer_info['manufacturer_id'],
                        ];
                    }
                }
                break;
            case 'ac_product':
                $this->load->model('catalog/product');
                $response = array();

                $product_info = $this->model_catalog_product->getProduct((int)$var);

                if ($product_info) {
                    $response = [
                        'param_label'       => $product_info['name'],
                        'param_value'       => $product_info['product_id'],
                    ];
                }
                break;
            case 'ac_category':
                $this->load->model('catalog/category');
                $response = array();

                $category_info = $this->model_catalog_category->getCategory((int)$var);

                if ($category_info) {
                    $response = [
                        'param_label'       => ($category_info['path']) ? $category_info['path'] . ' &gt; ' . $category_info['name'] : $category_info['name'],
                        'param_value'       => $category_info['category_id'],
                    ];
                }
                break;
            case 'ac_manufacturer':
                $this->load->model('catalog/manufacturer');
                $response = array();

                $manufacturer_info = $this->model_catalog_manufacturer->getManufacturer((int)$var);

                if ($manufacturer_info) {
                    $response = [
                        'param_label'       => $manufacturer_info['name'],
                        'param_value'       => $manufacturer_info['manufacturer_id'],
                    ];
                }
                break;
        }

        return $response;
    }
}
<?php
namespace Opencart\Admin\Model\Extension\Opex\Other;
class Opexcore extends \Opencart\System\Engine\Model {
    public function getAutocompleteInformations(array $data = []): array {
        $sql = "SELECT * FROM `" . DB_PREFIX . "information` i LEFT JOIN `" . DB_PREFIX . "information_description` id ON (i.`information_id` = id.`information_id`) WHERE id.`language_id` = '" . (int)$this->config->get('config_language_id') . "'";

        if (!empty($data['filter_name'])) {
            $sql .= " AND id.`title` LIKE '" . $this->db->escape('%' . (string)$data['filter_name'] . '%') . "'";
        }

        $sql .= " ORDER BY id.`title` ASC";

        if (isset($data['start']) || isset($data['limit'])) {
            if ($data['start'] < 0) {
                $data['start'] = 0;
            }

            if ($data['limit'] < 1) {
                $data['limit'] = 20;
            }

            $sql .= " LIMIT " . (int)$data['start'] . "," . (int)$data['limit'];
        }

        $query = $this->db->query($sql);

        return $query->rows;
    }
}
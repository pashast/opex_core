<?php
namespace Opencart\Admin\Model\Extension\Opex\Other;
class Opexcore extends \Opencart\System\Engine\Model {
    public function getAutocompleteInformations(array $data = []): array {
        $sql = "SELECT * FROM `" . DB_PREFIX . "information` i LEFT JOIN `" . DB_PREFIX . "information_description` id ON (i.`information_id` = id.`information_id`) WHERE id.`language_id` = '" . (int)$this->config->get('config_language_id') . "'";

        if (!empty($data['filter_name'])) {
            $sql .= " AND id.`title` LIKE '" . $this->db->escape('%' . $data['filter_name'] . '%') . "'";
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

    public function getAutocompleteModules(array $data = []): array {
        $sql = "SELECT * FROM `" . DB_PREFIX . "module` WHERE module_id > 0";

        if (!empty($data['filter_name'])) {
            $sql .= " AND `name` LIKE '" . $this->db->escape('%' . $data['filter_name'] . '%') . "'";
        }

        if (!empty($data['filter_code'])) {
            $sql .= " AND `code` = '" . $this->db->escape($data['filter_code']) . "'";
        }

        $sql .= " ORDER BY `name` ASC";

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

    public function getModule(int $module_id): array {
        $query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "module` WHERE `module_id` = '" . $module_id . "'");
        return $query->row;
    }

    public function getAutocompleteLayout(array $data = []): array {
        $sql = "SELECT * FROM `" . DB_PREFIX . "layout`";

        if (!empty($data['filter_name'])) {
            $sql .= " WHERE `name` LIKE '" . $this->db->escape('%' . $data['filter_name'] . '%') . "'";
        }

        $sql .= " ORDER BY `name` ASC";

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

    public function getLayout(int $layout_id): array {
        $query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "layout` WHERE `layout_id` = '" . $layout_id . "'");
        return $query->row;
    }
}
package io.bootify.pet_shop.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/colombia")
public class ColombiaController {

    @GetMapping("/departments")
    public Map<String, String[]> getDepartmentsAndCities() {
        Map<String, String[]> departments = new HashMap<>();
        
        departments.put("BOGOTA_DC", new String[]{"Bogotá"});
        departments.put("ANTIOQUIA", new String[]{"Medellín", "Bello", "Itagüí", "Envigado", "Rionegro"});
        departments.put("VALLE_DEL_CAUCA", new String[]{"Cali", "Palmira", "Buenaventura", "Tuluá"});
        departments.put("CUNDINAMARCA", new String[]{"Soacha", "Facatativá", "Zipaquirá", "Girardot"});
        departments.put("ATLANTICO", new String[]{"Barranquilla", "Soledad", "Malambo"});
        departments.put("SANTANDER", new String[]{"Bucaramanga", "Floridablanca", "Girón"});
        departments.put("BOLIVAR", new String[]{"Cartagena", "Magangué", "Turbaco"});
        departments.put("NORTE_DE_SANTANDER", new String[]{"Cúcuta", "Los Patios", "Villa del Rosario"});
        departments.put("BOYACA", new String[]{"Tunja", "Sogamoso", "Duitama"});
        departments.put("HUILA", new String[]{"Neiva", "Pitalito", "Garzón"});
        departments.put("TOLIMA", new String[]{"Ibagué", "Espinal", "Melgar"});
        departments.put("META", new String[]{"Villavicencio", "Acacías", "Granada"});
        departments.put("CALDAS", new String[]{"Manizales", "La Dorada", "Chinchiná"});
        departments.put("RISARALDA", new String[]{"Pereira", "Dosquebradas", "Santa Rosa de Cabal"});
        departments.put("QUINDIO", new String[]{"Armenia", "Calarcá", "La Tebaida"});
        departments.put("CAUCA", new String[]{"Popayán", "Santander de Quilichao"});
        departments.put("NARINO", new String[]{"Pasto", "Ipiales", "Tumaco"});
        departments.put("CORDOBA", new String[]{"Montería", "Cereté", "Sahagún"});
        departments.put("MAGDALENA", new String[]{"Santa Marta", "Ciénaga", "Fundación"});
        departments.put("CESAR", new String[]{"Valledupar", "Aguachica"});
        departments.put("LA_GUAJIRA", new String[]{"Riohacha", "Maicao", "Uribia"});
        departments.put("SUCRE", new String[]{"Sincelejo", "Corozal", "Sampués"});
        departments.put("ARAUCA", new String[]{"Arauca"});
        departments.put("CASANARE", new String[]{"Yopal"});
        departments.put("PUTUMAYO", new String[]{"Mocoa"});
        departments.put("AMAZONAS", new String[]{"Leticia"});
        departments.put("GUAINIA", new String[]{"Inírida"});
        departments.put("GUAVIARE", new String[]{"San José del Guaviare"});
        departments.put("VAUPES", new String[]{"Mitú"});
        departments.put("VICHADA", new String[]{"Puerto Carreño"});
        departments.put("SAN_ANDRES", new String[]{"San Andrés"});
        
        return departments;
    }
}
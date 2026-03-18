```
{
    "metadata": {
        "version_schema": string,
        "marca_de_tiempo": date,
        "jugador": string
    },
    "entrada": {
        "nombre": string,
        "raza": {"nombre": enum, "opciones"?: unknown},
        "descripcion"?: {
            <campos_string_num edad|peso|altura|...>?: string|number,
            <campos_enum sexo|region|clase_social|...>?: enum,
            "trasfondo"?: string,
            "imagenes"?: [<imagen path>]
        },
        "caracteristicas_del_ser": {
            "tipo": {"nombre": enum, opciones?},
            "gnosis": nonnegativeInt,
            "acumulacion_de_daño"?: bool,
            "creado_con_magia"?: bool,
            "criatura_con_pcs"?: bool,
            "habilidades_esenciales"?: [{<habilidad_esencial ... (enum)>: {pd, opciones?}}],
            "poderes"?: [{<poder ... (enum)>: {pd, opciones?}}],
        },
        "caracteristicas_primarias": {
            <caracteristica agi|con|des|fue|int|per|pod|vol>: {
                "base": positiveInt,
                "modificadores_base"?: [{
                    "fuente": string,
                    "valor": int,
                    "descripcion"?: string
                }],
                "modificadores_temporales"?: [{
                    "fuente": string,
                    "valor": int,
                    "descripcion"?: string
                }]
            }
        },
        "caracteristicas_secundarias": {
            "apariencia": {base, modificadores_base?, modificadores_temporales?},
            "tamaño": {modificadores_base?, modificadores_temporales?},
        },
        "capacidades_fisicas": {
            <capacidad_fisica: tipo_de_movimiento|indice_de_peso|cansancio|regeneracion>: {modificadores_base?, modificadores_temporales?}
        },
        "resistencias": {
            <resistencia: presencia|rf|rv|re|rm|rp>: {modificadores_base?, modificadores_temporales?}
        },
        "turno_base": {modificadores_base?, modificadores_temporales?},
        "puntos_de_creacion": {
            "ventajas": [{"nombre" enum, opciones?}],
            "desventajas"?: [{"nombre" enum, opciones?}],
            "pcs_liberalizados"?: [{"nombre": enum, opciones?, "eliminar_desventaja"?: bool}]
        },
        "categorias": [{
            "categoria": enum,
            "nivel": nonNegativeInt,
            "puntos_de_vida"?: {"pd": nonNegativeInt, modificadores_base?, modificadores_temporales?},
            "habilidades_de_combate"?: {
                <basicas: habilidad_de_ataque|habilidad_de_parada|habilidad_de_esquiva|llevar_armadura>: {pd, modificadores_base?, modificadores_temporales?},
                "arma_desarrollada": enum,
                "habilidades_del_ki"?: {
                    "puntos_de_ki"?: {
                        <puntos_de_ki agi|con|des|fue|pod|vol>?: {pd, modificadores_base?, modificadores_temporales?}
                    },
                    "acumulaciones_de_ki"?: {
                        <acumulaciones agi|con|des|fue|pod|vol>?: {pd, modificadores_base?, modificadores_temporales?}
                    },
                    "conocimiento_marcial"?: {pd, modificadores_base?, modificadores_temporales?}
                },
                "tablas_de_armas"?: [{<tabla ... (enum)>: {pd, opciones?}}],
                "tablas_de_estilos"?: [{<tabla ... (enum)>: {pd, opciones?}}],
                "artes_marciales"?: [
                    {<arte_marcial ... (enum)>?: {pd, opciones?}},
                    {<tabla_de_arte_marcial ... (enum)>?: {pd, opciones?}}
                ],
                "ars_magnus"?: [
                    {<ars_magnus_menor ... (enum)>?: {pd, opciones?}},
                    {<ars_magnus_mayor ... (enum)>?: {pd, opciones?}},
                    {<armas_imposibles ... (enum)>?: {pd, opciones?}},
                ],
                "tablas_de_combate_sobrenatural"?: [{<tabla ... (enum)>: {pd, opciones?}}],
            },
            "habilidades_sobrenaturales"?: {
                <basicas zeon|ACT|multiplo_de_regeneracion|proyeccion_magica>: {pd, modificadores_base?, modificadores_temporales?},
                "nivel_de_magia"?: {pd, modificadores_base?, modificadores_temporales?},
                "convocatoria"?: {
                    <convocatoria convocar|controlar|atar|desconvocar>: {pd, modificadores_base?, modificadores_temporales?},
                },
                "tablas_misticas"?: [{<tabla ... (enum)>: {pd, opciones?}}]
            },
            "habilidades_psiquicas"?: {
                <basicas CV|proyeccion_psiquica>: {pd, modificadores_base?, modificadores_temporales?},
                "tablas_psiquicas"?: [{<tabla ... (enum)>: {pd, opciones?}}],
                "patrones_mentales"?: [{<patron_mental ... (enum)>: {pd, opciones?}}]
            },
            "habilidades_secundarias"?: {
                <grupo_directo ...>: {
                    <habilidad_secundaria ... (enum)>: {base, modificadores_base?, modificadores_temporales?}
                },
                <grupo_pd ...>: {
                    <habilidad_secundaria ... (enum)>: {pd, modificadores_base?, modificadores_temporales?}
                },
                <grupo_derived ...>: {
                    <habilidad_secundaria ... (enum)>: {modificadores_base?, modificadores_temporales?}
                }
            },
            "cambio_de_categoria"?: {<categoria: previa|posterior>?: {pd}}
        }],
        "equipo"?: {
            "armaduras"?: [{
                "nombre": enum,
                "calidad"?: int_multiple_of_5,
                "encantada"?: bool,
                "modificadores_armadura"?: [{
                    "TA": <fil|con|pen|cal|ele|fri|ene>,
                    modificadores_base?,
                    modificadores_temporales?
                }]
            }],
            "armas"?: [{
                "nombre": enum,
                calidad?,
                "tamaño"?: <normal|enorme|gigante>,
                "modificadores_arma"?: [{
                    "nombre": <habilidad_de_ataque|habilidad_de_parada|habilidad_de_esquiva|daño|turno>,
                    modificadores_base?,
                    modificadores_temporales?
                }],
                "municion"?: {"nombre": enum, calidad?, tamaño?, modificadores_arma?},
                "manos"?: <una_mano|dos_manos>,
                "mano_habil"?: bool,
                "armas_combinadas"?: [{<armas>}]
            }]
        },
        "ki"?: {
            "habilidades_del_ki"?: [{"nombre": enum, opciones?}],
            "habilidades_del_nemesis"?: [{"nombre": enum, opciones?}],
            "tecnicas_del_dominio"?: [{
                "arbol": enum|string,
                "tecnicas": [{
                    "nombre": enum|string,
                    "descripcion"?: string,
                    "nivel"?: <1|2|3>,
                    "combinable"?: bool,
                    "efectos"?: [{
                        "nombre": enum,
                        "mantenido_o_sostenido"?: <mantenido|sostenimiento_menor|sostenimiento_mayor>,
                        "opciones": [<opcion ... enum>],
                        "coste": {
                            <caracteristica agi|con|des|fue|pod|vol>?: {
                                "activacion": nonnegativeInt,
                                "mantenimiento"?: nonnegativeInt,
                                "alteracion_por_cm"?: int
                            }
                        }
                    }],
                    "desventajas"?: [{"nombre": enum, opciones?}]
                }]
            }],
            "limites"?: [<limite ... enum>],
            "sellos_del_dragon"?: [<sello ... (enum)>],
            "invocacion_por_ki"?: {
                "sellos_de_invocacion": [<sello ... (enum)>],
                "pactos": [{"criatura": string, "sellos": {<sello ... (enum)>: nonnegativeInt}}]
            }
        },
        "misticos"?: {
            "niveles_de_magia"?: {
                <via_de_magia ... enum>?: {
                    "invertido": nonnegativeInt,
                    "subvia"?: enum,
                    "conjuros_libre_acceso"?: [{
                        "nombre": enum,
                        "nivel_libre_acceso": positiveInt
                    }]
                },
                "conjuros_seleccionados"?: [<conjuro ... (enum)]
            },
            "teorema_de_magia"?: {"nombre": enum, opciones?},
            "metamagia"?: [{
                "nombre": enum,
                "id": int,
                opciones?
            }],
            "especialidad_convocatoria"?: enum,
            "invocaciones"?: [<invocacion ... (enum)>],
            "encarnaciones"?: [<invocacion ... (enum)>],
            "sheele"?: unknown,
            "pacto_del_dragon"?: {"sacrificio": string, "descripcion_dragon": string}
        },
        "psiquicos"?: {
            "potencial_psiquico": {
                "cvs_invertidos": nonnegativeInt,
                modificadores_base?,
                modificadores_temporales?,
                "cristales_psi": nonnegativeInt
            },
            "innatos": {cvs_invertidos, modificadores_base?, modificadores_temporales?},
            "disciplinas": [{
                "disciplina": enum,
                "poderes_dominados": [{
                    "nombre": enum,
                    "fortalecimiento": {cvs_invertidos, modificadores_base?, modificadores_temporales?}
                }]
            }]
        },
        "elan"?: [{
            "nombre": enum, "nivel": nonnegativeInt, "dones": [<don ... (enum)>]
        }],
        "ajustes_de_nivel"?: {
            "ajuste_por_gnosis"?: <pd|pc>,
            "ajuste_por_legados"?: bool,
            "artefacto_vinculado"?: bool,
            "pds_adicionales"?: nonnegativeInt
        },
        "estado": {
            "pv": int,
            "cansancio": nonnegativeInt,
            "modificadores_globales": {
                "a_toda_accion": {modificadores_base?, modificadores_temporales?},
                "fisicos": {modificadores_base?, modificadores_temporales?}
            },
            "ki": {
                "puntos_de_ki": {"total": nonnegativeInt, OR <agi|con|des|fue|pod|vol>: nonnegativeInt},
                "tecnicas_y_habilidades_mantenidas"?: [{
                    "nombre": enum,
                    "coste"?: {
                        <agi|con|des|fue|pod|vol>?: {modificadores_base?, modificadores_temporales?}
                    }
                }],
            },
            "sobrenatural"?: {
                "zeon": nonnegativeInt,
                "zeon_acumulado"?: nonnegativeInt,
                "hechizos_mantenidos"?: [{
                    "nombre": enum,
                    "grado": <base|intermedio|avanzado|arcano>,
                    "coste"?: {modificadores_base?, modificadores_temporales?}
                }],
                "criaturas_atadas"?: [{
                    "nombre": string,
                    "coste": {base, modificadores_base?, modificadores_temporales?}
                }]
            },
            "mentalismo"?: {
                "CVs_libres": {
                    "gastados": nonnegativeInt,
                    "invertidos_en_innatos"?: nonnegativeInt
                },
                "turnos_concentrados"?: nonnegativeInt,
                "poderes_mantenidos"?: [{
                    "nombre": enum,
                    "potencial": enum
                }]
            },
            "puntos_de_destino"?: {"totales": nonnegativeInt, "usados": nonnegativeInt},
            "salud_mental"?: nonnegativeInt,
            "fama"?: {<grupo audacia|honorabilidad|habilidad|cobardia|infamia>?: nonnegativeInt}
        },
        "idiomas"?: [<idioma ... (enum)>],
        "notas"?: [{<seccion ...>: string}]
    },
    "catalogo_local": unknown
}
```
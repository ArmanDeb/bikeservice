import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Modal, TextInput, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { withObservables } from '@nozbe/watermelondb/react'
import { VehicleService } from '../../../src/services/VehicleService'
import VehicleItem from '../../../src/components/vehicle/VehicleItem'
import Vehicle from '../../../src/database/models/Vehicle'

// Motorcycle brand and model data - Comprehensive 2024-2025 lineups + Classics
const MOTORCYCLE_DATA: Record<string, string[]> = {
    // ═══════════════════════════════════════════════════════════════════
    // JAPANESE BIG 4
    // ═══════════════════════════════════════════════════════════════════
    'Yamaha': [
        // Supersport
        'YZF-R1', 'YZF-R1M', 'YZF-R7', 'YZF-R6', 'YZF-R3', 'YZF-R125', 'R9',
        // Hyper Naked
        'MT-10', 'MT-10 SP', 'MT-09', 'MT-09 SP', 'MT-07', 'MT-03', 'MT-125', 'MT-25',
        // Sport Heritage
        'XSR900', 'XSR900 GP', 'XSR700', 'XSR125', 'XSR155',
        // Sport Touring
        'Tracer 9', 'Tracer 9 GT', 'Tracer 9 GT+', 'Tracer 7', 'Tracer 7 GT', 'FJR1300', 'FJR1300A', 'FJR1300AS',
        // Adventure
        'Ténéré 700', 'Ténéré 700 Rally', 'Ténéré 700 Extreme', 'Ténéré 700 Explore', 'Super Ténéré', 'XT1200Z', 'XT660Z', 'XT660R', 'XT660X', 'XT600', 'XT550', 'XT500', 'XT250', 'TW200', 'TW125',
        // Cruiser
        'Bolt', 'Bolt R-Spec', 'V Star 250', 'V Star 650', 'V Star 950', 'V Star 1300', 'XV1900', 'XV1700', 'XV1100 Virago', 'XV750 Virago', 'XV535 Virago', 'XVS650 Dragstar', 'XVS1100 Dragstar',
        // Scooters
        'XMAX 300', 'XMAX 400', 'TMAX', 'TMAX Tech MAX', 'NMAX 125', 'NMAX 155', 'Zuma 125', 'RayZR', 'Aerox',
        // Off-Road
        'YZ450F', 'YZ250F', 'YZ250', 'YZ125', 'YZ85', 'YZ65', 'WR450F', 'WR250F', 'WR250R', 'WR250X', 'TT-R230', 'TT-R125', 'TT-R110', 'TT-R50', 'PW50',
        // Triple
        'Niken', 'Niken GT',
        // FZ/Fazer Series (Classics)
        'FZ1', 'FZ1 Fazer', 'FZ1N', 'FZ1S', 'FZ8', 'FZ8 Fazer', 'FZ8N', 'FZ8S', 'FZ6', 'FZ6 Fazer', 'FZ6N', 'FZ6S', 'FZ6S2', 'FZS600 Fazer', 'FZS1000 Fazer', 'FZ750', 'FZ400',
        // FZR Series (Classics)
        'FZR1000', 'FZR1000 EXUP', 'FZR750R', 'FZR750R OW01', 'FZR600', 'FZR600R', 'FZR400', 'FZR400RR', 'FZR250',
        // XJ Series (Classics)
        'XJ6', 'XJ6 Diversion', 'XJ6 Diversion F', 'XJ600', 'XJ600S Diversion', 'XJ600N', 'XJ900', 'XJ900S Diversion', 'XJR1300', 'XJR1200', 'XJR400',
        // TDM/TRX Series (Classics)
        'TDM900', 'TDM900A', 'TDM850', 'TRX850',
        // Other Classics
        'RD350', 'RD350 YPVS', 'RD500', 'RD500LC', 'SR400', 'SR500', 'SRX600', 'XS650', 'XS850', 'XS1100', 'V-Max', 'V-Max 1200', 'BT1100 Bulldog', 'TDR250', 'TZR250', 'DT125', 'DT125R', 'DT175'
    ],
    'Honda': [
        // Supersport
        'CBR1000RR-R Fireblade', 'CBR1000RR-R Fireblade SP', 'CBR1000RR', 'CBR600RR', 'CBR500R', 'CBR300R', 'CBR250RR', 'CBR250R', 'CBR150R', 'CBR125R',
        // CBR Classics
        'CBR1100XX Super Blackbird', 'CBR1000F', 'CBR900RR Fireblade', 'CBR929RR', 'CBR954RR', 'CBR600F', 'CBR600F2', 'CBR600F3', 'CBR600F4', 'CBR600F4i', 'CBR400RR', 'CBR250R MC22', 'CBR250 Four',
        // Naked/Standard CB Series
        'CB1000R', 'CB1000 Hornet', 'CB1000 Hornet SP', 'CB750 Hornet', 'CB650R', 'CB650F', 'CB500F', 'CB500 Hornet', 'CB300R', 'CB300F', 'CB125R', 'CB125F',
        // CB Classics
        'CB1300', 'CB1300 Super Four', 'CB1300 Super Bol d\'Or', 'CB1100', 'CB1100EX', 'CB1100RS', 'CB1000 Super Four', 'CB900F', 'CB750', 'CB750 Four', 'CB750 Nighthawk', 'CB650', 'CB650SC Nighthawk', 'CB600F Hornet', 'CB500', 'CB500 Four', 'CB500S', 'CB500X', 'CB400SF Super Four', 'CB400', 'CB350', 'CB250', 'CB223S',
        // CBF Series
        'CBF1000', 'CBF1000A', 'CBF600', 'CBF600N', 'CBF600S', 'CBF500', 'CBF500A', 'CBF250', 'CBF125',
        // Adventure/Touring
        'Africa Twin CRF1100L', 'Africa Twin Adventure Sports', 'XL750 Transalp', 'XL700V Transalp', 'XL650V Transalp', 'XL600V Transalp', 'NC750X', 'NC700X', 'NC750S', 'NC700S', 'NT1100', 'NT700V Deauville', 'NT650V Deauville', 'Gold Wing', 'Gold Wing Tour', 'Gold Wing 1800', 'Gold Wing 1500', 'ST1300 Pan European', 'ST1100 Pan European',
        // VFR Series
        'VFR1200F', 'VFR1200X Crosstourer', 'VFR800', 'VFR800F', 'VFR800X Crossrunner', 'VFR750F', 'VFR400R', 'VFR400 NC30',
        // Cruiser
        'Rebel 1100', 'Rebel 1100 DCT', 'Rebel 500', 'Rebel 300', 'Fury', 'Shadow 750', 'Shadow 600', 'Shadow 125', 'Shadow Phantom', 'Shadow Aero', 'VT1100', 'VT750', 'VT600', 'VT500',
        // Dual Sport
        'CRF450RL', 'CRF300L', 'CRF300L Rally', 'CRF250L', 'CRF250L Rally', 'XR650L', 'XR650R', 'XR600R', 'XR400R', 'XR250', 'XR150L', 'NX650 Dominator', 'XL600R', 'XL500', 'XL250',
        // XRV/Africa Twin Classic
        'XRV750 Africa Twin', 'XRV650 Africa Twin',
        // Scooters
        'Forza 750', 'Forza 350', 'Forza 300', 'Forza 125', 'ADV 160', 'ADV 150', 'PCX 160', 'PCX 150', 'PCX 125', 'SH350', 'SH300', 'SH150', 'SH125', 'Vario', 'Integra', 'Silverwing 600', 'PC800 Pacific Coast',
        // MiniMOTO/Urban
        'Grom', 'Grom SP', 'Monkey 125', 'Dax 125', 'Super Cub C125', 'Super Cub C110', 'Trail 125', 'Navi', 'MSX125',
        // Off-Road/Motocross
        'CRF450R', 'CRF450RX', 'CRF450X', 'CRF250R', 'CRF250RX', 'CRF250X', 'CRF250F', 'CRF150R', 'CRF125F', 'CRF110F', 'CRF50F', 'CR250R', 'CR125R',
        // X-ADV
        'X-ADV 750', 'X-ADV',
        // NTV/Bros
        'NTV650', 'NTV600', 'NT650 Hawk GT', 'Bros 650', 'Bros 400',
        // Other Classics
        'Varadero 1000', 'Varadero 125', 'Deauville', 'Hornet 600', 'Hornet 900', 'CB-1', 'CBX1000', 'CBX750', 'CB550', 'CB450', 'CX500', 'CX650', 'GL1000', 'GL1100', 'GL1200', 'VTR1000F Firestorm', 'VTR1000 SP1', 'VTR1000 SP2', 'VTR250', 'NSR250', 'NSR125', 'NS400R', 'RC51', 'RC45', 'RC30'
    ],
    'Kawasaki': [
        // Hypersport
        'Ninja H2', 'Ninja H2 Carbon', 'Ninja H2R', 'Ninja H2 SX', 'Ninja H2 SX SE', 'Ninja H2 SX SE+',
        // Supersport
        'Ninja ZX-14R', 'Ninja ZX-10R', 'Ninja ZX-10RR', 'Ninja ZX-10R KRT', 'Ninja ZX-6R', 'Ninja ZX-6R KRT', 'Ninja ZX-4R', 'Ninja ZX-4RR', 'Ninja 650', 'Ninja 500', 'Ninja 400', 'Ninja 300', 'Ninja 250R', 'Ninja 125',
        // Sport Touring
        'Ninja 1100SX', 'Ninja 1000SX', 'Ninja 1000', 'Ninja 650 Tourer',
        // Naked/Z Series Current
        'Z H2', 'Z H2 SE', 'Z900', 'Z900 SE', 'Z900RS', 'Z900RS Cafe', 'Z900RS SE', 'Z650', 'Z650RS', 'Z500', 'Z400', 'Z300', 'Z250', 'Z125 Pro',
        // Z Series Classics
        'Z1000', 'Z1000SX', 'Z1000R', 'Z800', 'Z800e', 'Z750', 'Z750R', 'Z750S', 'ZR-7', 'ZR-7S', 'Z550', 'Z500', 'Z440', 'Z400J', 'Z400', 'Z250SL', 'Z1', 'Z2', 'Z1000 (1977)',
        // Retro
        'W800', 'W800 Cafe', 'W800 Street', 'W650', 'W400', 'W230', 'Zephyr 1100', 'Zephyr 750', 'Zephyr 550', 'Zephyr 400',
        // ZRX Series
        'ZRX1200R', 'ZRX1200S', 'ZRX1200 DAEG', 'ZRX1100', 'ZRX400',
        // Cruiser
        'Vulcan 2000', 'Vulcan 1700 Voyager', 'Vulcan 1700 Vaquero', 'Vulcan 1600', 'Vulcan 1500', 'Vulcan 900 Classic', 'Vulcan 900 Custom', 'Vulcan 800', 'Vulcan S', 'Eliminator 500', 'Eliminator 400', 'Eliminator 250',
        // Adventure
        'Versys 1100', 'Versys 1000', 'Versys 1000 SE', 'Versys 650', 'Versys 650 LT', 'Versys-X 300', 'Versys-X 250',
        // Dual Sport
        'KLR650', 'KLR650 Adventure', 'KLR600', 'KLR250', 'KLX300', 'KLX300SM', 'KLX250', 'KLX250S', 'KLX230', 'KLX230S', 'KLX150', 'KLX125', 'KLE500', 'KLE400',
        // Off-Road/Motocross
        'KX450', 'KX450SR', 'KX450X', 'KX250', 'KX250X', 'KX112', 'KX85', 'KX65', 'KLX300R', 'KLX230R', 'KLX140R', 'KLX110R',
        // Electric/Hybrid
        'Ninja 7 Hybrid', 'Z7 Hybrid', 'Ninja e-1', 'Z e-1',
        // ZZR Series
        'ZZR1400', 'ZZR1200', 'ZZR1100', 'ZZR600', 'ZZR400', 'ZZR250',
        // GPZ Series
        'GPZ900R', 'GPZ1000RX', 'GPZ1100', 'GPZ750', 'GPZ750 Turbo', 'GPZ600R', 'GPZ550', 'GPZ500S', 'GPZ400', 'GPZ305', 'GPZ250',
        // GPX/Ninja Classics
        'GPX750R', 'GPX600R', 'GPX400R', 'GPX250R',
        // ER Series
        'ER-6N', 'ER-6F', 'ER-5', 'ER500',
        // ZX Classics
        'ZX-12R', 'ZX-10', 'ZX-10 Tomcat', 'ZX-9R', 'ZX-7R', 'ZX-7RR', 'ZX-6R (1998)', 'ZXR750', 'ZXR400', 'ZXR250',
        // Other Classics
        'Concours 14', 'Concours 1000', 'GTR1400', 'GTR1000', 'ZG1400', 'ZG1000', 'Z1300', 'Z1100', 'Z1000J', 'GPZ1100F', 'KZ1000', 'KZ900', 'KZ750', 'KZ650', 'KZ550', 'KZ440', 'KZ400'
    ],
    'Suzuki': [
        // Supersport
        'Hayabusa', 'GSX-R1000', 'GSX-R1000R', 'GSX-R750', 'GSX-R600', 'GSX-R250', 'GSX-R150', 'GSX-R125', 'GSX-8R', 'GSX-250R',
        // GSX-R Classics
        'GSX-R1100', 'GSX-R1100W', 'GSX-R750 SRAD', 'GSX-R750W', 'GSX-R600 SRAD', 'GSX-R400', 'GSX-R250 (1987)',
        // Naked/Street Current
        'GSX-S1000', 'GSX-S1000GT', 'GSX-S1000GT+', 'GSX-S1000GX', 'GSX-S1000GX+', 'GSX-S1000F', 'GSX-S950', 'GSX-S750', 'GSX-8S', 'GSX-S125', 'GSX-S150', 'Katana', 'SV650', 'SV650X', 'SV650S',
        // SV Series
        'SV1000', 'SV1000S', 'SV650 (2003)', 'SV650S (2003)', 'SV400', 'Gladius', 'SFV650',
        // Adventure V-Strom
        'V-Strom 1050', 'V-Strom 1050DE', 'V-Strom 1050DE Adventure', 'V-Strom 1000', 'V-Strom 1000XT', 'V-Strom 800', 'V-Strom 800DE', 'V-Strom 650', 'V-Strom 650XT', 'V-Strom 250', 'DL1000', 'DL650', 'DL250',
        // Bandit/GSF Series
        'Bandit 1250', 'Bandit 1250S', 'Bandit 1250F', 'Bandit 1200', 'Bandit 1200S', 'Bandit 650', 'Bandit 650S', 'Bandit 600', 'Bandit 600S', 'Bandit 400', 'Bandit 250', 'GSF1250', 'GSF1200', 'GSF650', 'GSF600', 'GSF400', 'GSF250',
        // GSX/GS Classics
        'GSX1400', 'GSX1300R Hayabusa', 'GSX1100', 'GSX1100S Katana', 'GSX1100F', 'GSX1100G', 'GSX750', 'GSX750S Katana', 'GSX750F', 'GSX600F', 'GSX550', 'GSX400', 'GSX250', 'GS1000', 'GS850', 'GS750', 'GS650', 'GS550', 'GS500', 'GS500E', 'GS500F', 'GS450', 'GS400', 'GS250',
        // RF Series
        'RF900R', 'RF600R', 'RF400R',
        // TL Series
        'TL1000R', 'TL1000S',
        // Cruiser
        'Boulevard M109R', 'Boulevard M90', 'Boulevard C109R', 'Boulevard C90', 'Boulevard C50', 'Boulevard C50T', 'Boulevard S83', 'Boulevard S50', 'Boulevard S40', 'Intruder 1800', 'Intruder 1500', 'Intruder 1400', 'Intruder 800', 'Intruder 750', 'Intruder 600', 'Intruder 400', 'Intruder 250', 'VZ800 Marauder', 'VL1500', 'VL800', 'VS1400 Intruder', 'VS800 Intruder', 'VS750 Intruder', 'VS600 Intruder', 'LS650 Savage',
        // Dual Sport
        'DR-Z4S', 'DR-Z4SM', 'DR-Z400S', 'DR-Z400SM', 'DR-Z400E', 'DR650S', 'DR650SE', 'DR650R', 'DR350', 'DR250', 'DR200S', 'DR125', 'TS250', 'TS185', 'TS125',
        // Off-Road
        'RM-Z450', 'RM-Z250', 'RM250', 'RM125', 'RM85', 'DR-Z125L', 'DR-Z125', 'DR-Z70', 'DR-Z50',
        // Scooters
        'Burgman 650', 'Burgman 400', 'Burgman 200', 'Burgman 125', 'Address 125', 'Address 110',
        // Other Classics
        'Inazuma 250', 'Inazuma 400', 'GN250', 'GN125', 'TU250X', 'VanVan 200', 'RGV250', 'RG500', 'RG250', 'GT750', 'GT550', 'GT380', 'GT250', 'RE5', 'Goose 350'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // EUROPEAN PREMIUM
    // ═══════════════════════════════════════════════════════════════════
    'BMW': [
        // M Sport
        'M 1000 RR', 'M 1000 R', 'M 1000 XR',
        // Sport
        'S 1000 RR', 'S 1000 R', 'S 1000 XR',
        // Adventure
        'R 1300 GS', 'R 1300 GS Adventure', 'R 1250 GS', 'R 1250 GS Adventure', 'F 900 GS', 'F 900 GS Adventure', 'F 850 GS', 'F 850 GS Adventure', 'F 800 GS', 'G 310 GS',
        // Roadster/Naked
        'R 12', 'R 12 nineT', 'R 12 S', 'R 12 G/S', 'F 900 R', 'F 900 XR', 'G 310 R',
        // Tour
        'R 1250 RT', 'K 1600 GT', 'K 1600 GTL', 'K 1600 B', 'K 1600 Grand America',
        // Heritage
        'R 18', 'R 18 Classic', 'R 18 Roctane', 'R 18 B', 'R 18 Transcontinental',
        // R nineT Series
        'R nineT', 'R nineT Pure', 'R nineT Scrambler', 'R nineT Urban G/S',
        // Electric/Urban
        'CE 04', 'CE 02', 'C 400 X', 'C 400 GT',
        // Classics
        'R 1200 GS', 'R 1200 RT', 'R 1200 RS', 'F 800 R', 'F 800 ST', 'K 1300 S', 'K 1300 R', 'K 1200 S', 'HP4', 'S 1000 R (2014)', 'G 650 GS', 'F 650 GS'
    ],
    'Ducati': [
        // Superbike
        'Panigale V4', 'Panigale V4 S', 'Panigale V4 SP2', 'Panigale V4 R', 'Panigale V4 Tricolore', 'Panigale V2', 'Panigale V2 Tricolore', 'Superleggera V4',
        // Streetfighter
        'Streetfighter V4', 'Streetfighter V4 S', 'Streetfighter V4 SP2', 'Streetfighter V4 Lamborghini', 'Streetfighter V2', 'Streetfighter V2 S',
        // Monster
        'Monster', 'Monster Plus', 'Monster SP', 'Monster SP+',
        // Multistrada
        'Multistrada V4', 'Multistrada V4 S', 'Multistrada V4 Pikes Peak', 'Multistrada V4 Rally', 'Multistrada V4 RS', 'Multistrada V2', 'Multistrada V2 S',
        // Diavel
        'Diavel V4', 'Diavel V4 For Bentley', 'XDiavel', 'XDiavel S',
        // Scrambler
        'Scrambler Icon', 'Scrambler Icon Dark', 'Scrambler Full Throttle', 'Scrambler Nightshift', 'Scrambler Urban Motard',
        // DesertX
        'DesertX', 'DesertX Rally', 'DesertX Discovery',
        // Hypermotard
        'Hypermotard 950', 'Hypermotard 950 SP', 'Hypermotard 950 RVE', 'Hypermotard 698 Mono', 'Hypermotard 698 Mono RVE',
        // SuperSport
        'SuperSport 950', 'SuperSport 950 S',
        // Classics
        '748', '749', '848', '899', '959', '998', '999', '1098', '1198', '1199', '1299', 'Monster 696', 'Monster 796', 'Monster 821', 'Monster 1100', 'Monster 1200', 'Hyperstrada', 'ST2', 'ST3', 'ST4', 'Paso', 'Multistrada 1200', 'Multistrada 1260'
    ],
    'KTM': [
        // Duke (Naked)
        '125 Duke', '200 Duke', '250 Duke', '390 Duke', '690 Duke', '790 Duke', '890 Duke', '890 Duke R', '990 Duke', '990 Duke R', '1290 Super Duke R', '1390 Super Duke R', '1390 Super Duke R Evo',
        // RC (Sport)
        'RC 125', 'RC 200', 'RC 390', 'RC 8C',
        // Adventure
        '250 Adventure', '390 Adventure', '390 Adventure SW', '790 Adventure', '890 Adventure', '890 Adventure R', '890 Adventure R Rally', '1290 Super Adventure R', '1290 Super Adventure S', '1390 Super Adventure R', '1390 Super Adventure S', '1390 Super Adventure S Evo',
        // Sport Tourer
        '1290 Super Duke GT', '1390 Super Duke GT', '890 SMT',
        // Enduro
        '125 XC-W', '150 EXC', '250 EXC', '250 EXC-F', '300 EXC', '300 EXC Hardenduro', '350 EXC-F', '450 EXC-F', '500 EXC-F', '500 EXC-F Six Days',
        // Motocross
        '50 SX', '65 SX', '85 SX', '125 SX', '150 SX', '250 SX', '250 SX-F', '350 SX-F', '450 SX-F', '450 SX-F Factory Edition',
        // Rally
        '450 Rally Replica',
        // Supermoto
        '450 SMR',
        // Electric
        'Freeride E-XC', 'SX-E 2', 'SX-E 3', 'SX-E 5'
    ],
    'Triumph': [
        // Modern Classics
        'Bonneville T100', 'Bonneville T120', 'Bonneville T120 Black', 'Bonneville Bobber', 'Bonneville Speedmaster', 'Speed Twin 900', 'Speed Twin 1200', 'Speed Twin 1200 RS', 'Thruxton RS', 'Scrambler 900', 'Scrambler 1200 X', 'Scrambler 1200 XE', 'Speed 400', 'Scrambler 400 X',
        // Roadsters
        'Street Triple 765 R', 'Street Triple 765 RS', 'Speed Triple 1200 RS', 'Speed Triple 1200 RR', 'Speed Triple 1200 RX', 'Trident 660',
        // Adventure
        'Tiger Sport 660', 'Tiger 850 Sport', 'Tiger 900 Rally', 'Tiger 900 Rally Pro', 'Tiger 900 GT', 'Tiger 900 GT Pro', 'Tiger 1200 Rally', 'Tiger 1200 Rally Pro', 'Tiger 1200 Rally Explorer', 'Tiger 1200 GT', 'Tiger 1200 GT Pro', 'Tiger 1200 GT Explorer',
        // Rocket
        'Rocket 3 R', 'Rocket 3 GT', 'Rocket 3 Storm R', 'Rocket 3 Storm GT',
        // Supersport
        'Daytona 660',
        // Motocross
        'TF 250-X', 'TF 450-RC',
        // Classics
        'Bonneville', 'Bonneville SE', 'Thunderbird', 'Thunderbird Storm', 'Sprint ST', 'Sprint GT', 'Tiger 800', 'Tiger 1050', 'Tiger 1050 Sport', 'Street Triple 675', 'Daytona 675', 'Daytona 675R'
    ],
    'Aprilia': [
        // Supersport
        'RSV4 1100', 'RSV4 1100 Factory', 'RSV4 X ex3ma', 'RS 660', 'RS 660 Extrema', 'RS 660 Factory', 'RS 457', 'RS 125',
        // Naked
        'Tuono V4 1100', 'Tuono V4 1100 Factory', 'Tuono 660', 'Tuono 660 Factory', 'Tuono 457', 'Tuono 125', 'Shiver 900', 'Dorsoduro 900',
        // Adventure
        'Tuareg 660', 'Tuareg 660 Rally',
        // Supermoto/Enduro
        'SX 125', 'RX 125',
        // Scooters
        'SR GT 200', 'SR 125',
        // Classics
        'RSV 1000', 'RSV Mille', 'RS 250', 'RS 125 (2-stroke)', 'Falco', 'Pegaso', 'Mana', 'Caponord'
    ],
    'MV Agusta': [
        // F Series (Sport)
        'F3 675', 'F3 800', 'F3 RR', 'F4', 'F4 RC', 'F4 RR', 'Superveloce', 'Superveloce S', 'Superveloce 1000 Serie Oro',
        // Brutale (Naked)
        'Brutale 800', 'Brutale 800 RR', 'Brutale 800 RR SCS', 'Brutale 800 Dragster', 'Brutale 1000 RS', 'Brutale 1000 RR', 'Brutale 1000 Nürburgring',
        // Dragster
        'Dragster 800', 'Dragster 800 RR', 'Dragster 800 RC', 'Dragster 800 SCS',
        // Rush
        'Rush 1000',
        // Touring
        'Turismo Veloce', 'Turismo Veloce Lusso', 'Turismo Veloce Rosso',
        // Lucky Explorer
        'Lucky Explorer 9.5', 'Lucky Explorer 5.5'
    ],
    'Moto Guzzi': [
        // V7 Series
        'V7 Stone', 'V7 Special', 'V7 Stone Special Edition', 'V7 850',
        // V85 Series
        'V85 TT', 'V85 TT Travel', 'V85 TT Evocative', 'V85 TT Guardia d\'Onore',
        // V100 Series
        'V100 Mandello', 'V100 Mandello S', 'V100 Mandello Aviazione Navale',
        // Stelvio
        'Stelvio', 'Stelvio Tribute',
        // Cruiser
        'Audace', 'Eldorado', 'California 1400',
        // Classics
        'Griso', 'Norge', 'Stelvio 1200', 'Breva', 'V11', 'Le Mans', 'California', 'Nevada'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // AMERICAN
    // ═══════════════════════════════════════════════════════════════════
    'Harley-Davidson': [
        // Sportster
        'Sportster S', 'Nightster', 'Nightster Special', 'Iron 883', 'Iron 1200', 'Forty-Eight', 'SuperLow', 'Roadster',
        // Softail/Cruiser
        'Fat Boy', 'Fat Boy 114', 'Fat Boy Lo', 'Low Rider', 'Low Rider S', 'Low Rider ST', 'Low Rider El Diablo', 'Street Bob', 'Street Bob 114', 'Fat Bob', 'Fat Bob 114', 'Breakout', 'Breakout 117', 'Softail Standard', 'Heritage Classic', 'Heritage Classic 114', 'Softail Slim', 'Softail Deluxe',
        // Grand American Touring
        'Street Glide', 'Street Glide Special', 'Street Glide ST', 'Street Glide Ultra', 'Road Glide', 'Road Glide Special', 'Road Glide Limited', 'Road Glide ST', 'Road King', 'Road King Special', 'Ultra Limited', 'Electra Glide Ultra Classic', 'Electra Glide Standard',
        // Adventure Touring
        'Pan America 1250', 'Pan America 1250 Special', 'Pan America 1250 ST',
        // Trike
        'Freewheeler', 'Tri Glide Ultra', 'Road Glide 3',
        // CVO
        'CVO Street Glide', 'CVO Road Glide', 'CVO Road Glide ST', 'CVO Pan America', 'CVO Limited', 'CVO Road Glide Limited', 'CVO Tri Glide',
        // Classics
        'V-Rod', 'Night Rod', 'Street 750', 'Street 500', 'XR1200', 'Dyna Street Bob', 'Dyna Low Rider', 'Wide Glide', 'Rocker', 'Springer Softail'
    ],
    'Indian': [
        // Scout
        'Scout', 'Scout Bobber', 'Scout Bobber Twenty', 'Scout Rogue', 'Scout Sixty', 'Sport Scout', 'Super Scout', '101 Scout',
        // FTR
        'FTR 1200', 'FTR 1200 S', 'FTR 1200 Rally', 'FTR 1200 R Carbon', 'FTR x 100%', 'FTR Sport',
        // Chief
        'Chief', 'Chief Dark Horse', 'Chief Bobber', 'Chief Bobber Dark Horse', 'Super Chief', 'Super Chief Limited',
        // Cruiser
        'Sport Chief',
        // Bagger
        'Chieftain', 'Chieftain Dark Horse', 'Chieftain Limited', 'Chieftain Elite', 'Indian Springfield', 'Indian Springfield Dark Horse', 'Challenger', 'Challenger Dark Horse', 'Challenger Limited', 'Challenger Elite',
        // Touring
        'Pursuit', 'Pursuit Dark Horse', 'Pursuit Limited', 'Pursuit Elite', 'Roadmaster', 'Roadmaster Dark Horse', 'Roadmaster Limited', 'Roadmaster Elite'
    ],
    'Buell': [
        '1190RX', '1190SX', 'Hammerhead 1190', 'Super Cruiser',
        // Classics
        'XB12R Firebolt', 'XB12S Lightning', 'XB9R Firebolt', 'XB9S Lightning', 'S1 Lightning', 'S2 Thunderbolt', 'S3 Thunderbolt', 'X1 Lightning', 'Blast', 'Ulysses XB12X', '1125R', '1125CR'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // CHINESE/ASIAN EMERGING
    // ═══════════════════════════════════════════════════════════════════
    'CF Moto': [
        // NK Series (Naked)
        '125NK', '250NK', '300NK', '400NK', '450NK', '650NK', '800NK', '800NK Sport',
        // SS Series (Sport)
        '300SS', '450SS', '450SR', '450SR-S', '675SS', '675SR-R',
        // CL-X Series (Classic/Retro)
        '700CL-X Heritage', '700CL-X Sport', '700CL-X Adventure', '450CL-C',
        // MT Series (Adventure)
        '450MT', '700MT', '800MT', '800MT-ES', '800MT-X', '800MT Sport+', '1000MT-X', '1250TR-G',
        // Papio (Mini)
        'Papio', 'Papio SS', 'Papio CL',
        // IBex (Adventure)
        'Ibex 450', 'Ibex 800', 'Ibex 800 E'
    ],
    'Benelli': [
        // Naked
        'TNT 125', 'TNT 135', 'TNT 249S', 'TNT 302S', 'TNT 600', 'TNT 600i', 'TNT 899', 'TNT 1130',
        // Cruiser
        '502C', '752S', 'Leoncino 500', 'Leoncino 500 Trail', 'Leoncino 250', 'Leoncino 800', 'Leoncino 800 Trail',
        // Adventure
        'TRK 251', 'TRK 502', 'TRK 502X', 'TRK 702', 'TRK 702X', 'TRK 800',
        // Sport
        '302R', 'BN 302', '600RR',
        // Classics
        'Imperiale 400', 'Imperiale 530'
    ],
    'QJ Motor': [
        // Naked
        'SRK 400', 'SRK 700', 'SRK 800',
        // Adventure
        'SRT 800', 'SRT 800X',
        // Cruiser
        'SRV 550', 'SRV 300',
        // Retro
        'SRV 800'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // OFF-ROAD/ENDURO SPECIALISTS
    // ═══════════════════════════════════════════════════════════════════
    'Husqvarna': [
        // Street
        'Svartpilen 125', 'Svartpilen 401', 'Svartpilen 801', 'Vitpilen 125', 'Vitpilen 401', 'Vitpilen 801',
        // Adventure
        'Norden 901', 'Norden 901 Expedition',
        // Supermoto
        '701 Supermoto', 'FS 450',
        // Enduro Street
        '701 Enduro', '701 Enduro LR',
        // Enduro 4-Stroke
        'FE 250', 'FE 350', 'FE 450', 'FE 501', 'FE 501s',
        // Enduro 2-Stroke
        'TE 150i', 'TE 250i', 'TE 300i',
        // Motocross 4-Stroke
        'FC 250', 'FC 350', 'FC 450', 'FC 450 Rockstar Edition',
        // Motocross 2-Stroke
        'TC 85', 'TC 125', 'TC 250',
        // Electric
        'EE 5'
    ],
    'Gas Gas': [
        // Enduro Street
        'ES 700',
        // Supermoto
        'SM 700',
        // Enduro 4-Stroke
        'EC 250F', 'EC 350F', 'EC 450F', 'EC 500F',
        // Enduro 2-Stroke
        'EC 250', 'EC 300',
        // Motocross 4-Stroke
        'MC 250F', 'MC 350F', 'MC 450F', 'MC 450F Factory Edition',
        // Motocross 2-Stroke
        'MC 50', 'MC 65', 'MC 85', 'MC 125', 'MC 250',
        // Trial
        'TXT GP 300', 'TXT Racing 280', 'TXT Racing 300'
    ],
    'Beta': [
        // Enduro 4-Stroke
        'RR 350', 'RR 390', 'RR 430', 'RR 480', 'RR 350 Racing', 'RR 390 Racing', 'RR 430 Racing', 'RR 480 Racing',
        // Enduro 2-Stroke
        'RR 125', 'RR 200', 'RR 250', 'RR 300', 'RR 125 Racing', 'RR 200 Racing', 'RR 250 Racing', 'RR 300 Racing',
        // Xtrainer
        'Xtrainer 250', 'Xtrainer 300',
        // Motocross
        'RX 250', 'RX 300', 'RX 350', 'RX 390', 'RX 430', 'RX 480',
        // Supermoto
        'RR 125 Motard', 'RR 350 Motard', 'RR 390 Motard',
        // Trial
        'Evo 125', 'Evo 200', 'Evo 250', 'Evo 300', 'Evo Factory 250', 'Evo Factory 300'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // ELECTRIC
    // ═══════════════════════════════════════════════════════════════════
    'Zero': [
        // Street
        'SR/F', 'SR/F Premium', 'SR/S', 'SR/S Premium', 'S', 'S Premium', 'DS', 'DSR/X',
        // Supermoto/Dual Sport
        'FX', 'FXE', 'FXS',
        // Youth
        'FX Junior'
    ],
    'Energica': [
        'Ego', 'Ego+', 'Ego+ RS', 'Eva', 'Eva EsseEsse9+', 'Eva Ribelle', 'Experia', 'Experia Sport'
    ],
    'LiveWire': [
        'One', 'S2 Del Mar', 'S2 Mulholland'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // CLASSIC/RETRO
    // ═══════════════════════════════════════════════════════════════════
    'Royal Enfield': [
        // 650 Twins
        'Continental GT 650', 'Interceptor 650', 'Super Meteor 650', 'Super Meteor 650 Tourer', 'Shotgun 650', 'Bear 650', 'Classic 650 Twin',
        // 450 Platform
        'Himalayan 450', 'Guerrilla 450', 'Scram 440',
        // 350 Classics
        'Classic 350', 'Meteor 350', 'Bullet 350', 'Hunter 350', 'Hunter 350 Sport',
        // Himalayan
        'Himalayan', 'Scram 411',
        // Goan
        'Goan Classic 350',
        // Classics
        'Thunderbird', 'Continental GT', 'Classic 500', 'Bullet 500', 'Electra'
    ],

    // ═══════════════════════════════════════════════════════════════════
    // OTHER
    // ═══════════════════════════════════════════════════════════════════
    'Other': []
}

const BRANDS = Object.keys(MOTORCYCLE_DATA)

// Autocomplete Dropdown Component
const AutocompleteInput = ({
    label,
    value,
    onChangeText,
    options,
    onSelect,
    placeholder,
    filterMode = 'includes' // 'startsWith' for brands, 'includes' for models
}: {
    label: string
    value: string
    onChangeText: (text: string) => void
    options: string[]
    onSelect: (option: string) => void
    placeholder: string
    filterMode?: 'startsWith' | 'includes'
}) => {
    const [isFocused, setIsFocused] = useState(false)

    // Filter options based on input and filter mode
    const filteredOptions = value
        ? options.filter(opt =>
            filterMode === 'startsWith'
                ? opt.toLowerCase().startsWith(value.toLowerCase())
                : opt.toLowerCase().includes(value.toLowerCase())
        )
        : []

    // Only show dropdown when user has typed something and there are matches
    const showDropdown = isFocused && value.length > 0 && filteredOptions.length > 0

    return (
        <View className="mb-3 z-10">
            <Text className="text-neutral-400 text-xs uppercase mb-2 tracking-wider">{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#666"
                className={`bg-neutral-800 text-white p-3 rounded-xl text-lg ${showDropdown ? 'rounded-b-none border-b-0' : ''} border border-neutral-700`}
                value={value}
                onChangeText={(text) => {
                    onChangeText(text)
                    // Re-enable focus when user starts typing again
                    if (text.length > 0 && !isFocused) {
                        setIsFocused(true)
                    }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow tap
            />
            {showDropdown && (
                <View className="bg-neutral-800 border border-neutral-700 border-t-0 rounded-b-xl max-h-64 overflow-hidden">
                    <FlatList
                        data={filteredOptions.slice(0, 20)} // Show up to 20 suggestions
                        keyExtractor={item => item}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item)
                                    setIsFocused(false)
                                }}
                                className="px-4 py-3 border-b border-neutral-700/50"
                            >
                                <Text className="text-white text-base">{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    )
}

// Reusable Vehicle Modal for Add & Edit
const VehicleModal = ({ visible, onClose, vehicle }: { visible: boolean, onClose: () => void, vehicle?: Vehicle | null }) => {
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [mileage, setMileage] = useState('')
    const [vin, setVin] = useState('')

    // Get available models for selected brand (check both exact match and partial)
    const getModelsForBrand = () => {
        // First try exact match
        if (MOTORCYCLE_DATA[brand]) return MOTORCYCLE_DATA[brand]
        // Then try to find a brand that matches the input
        const matchingBrand = BRANDS.find(b => b.toLowerCase() === brand.toLowerCase())
        if (matchingBrand && MOTORCYCLE_DATA[matchingBrand]) return MOTORCYCLE_DATA[matchingBrand]
        return []
    }
    const availableModels = getModelsForBrand()

    // Reset/Populate form when modal opens or vehicle changes
    React.useEffect(() => {
        if (visible) {
            if (vehicle) {
                setBrand(vehicle.brand)
                setModel(vehicle.model)
                setYear(vehicle.year?.toString() || '')
                setMileage(vehicle.currentMileage.toString())
                setVin(vehicle.vin || '')
            } else {
                setBrand('')
                setModel('')
                setYear('')
                setMileage('')
                setVin('')
            }
        }
    }, [visible, vehicle])

    const handleBrandSelect = (selectedBrand: string) => {
        setBrand(selectedBrand)
        setModel('') // Reset model when brand changes
    }

    const handleModelSelect = (selectedModel: string) => {
        setModel(selectedModel)
    }

    const handleSubmit = async () => {
        if (!brand || !model || !mileage) {
            Alert.alert('Missing Info', 'Please fill in brand, model and mileage')
            return
        }

        const yearInt = parseInt(year) || new Date().getFullYear()

        if (vehicle) {
            await VehicleService.updateVehicle(vehicle, brand, model, yearInt, vin || undefined, parseInt(mileage))
        } else {
            await VehicleService.createVehicle(brand, model, yearInt, vin || undefined, parseInt(mileage))
        }

        onClose()
    }

    const handleDelete = () => {
        if (!vehicle) return

        Alert.alert(
            "Delete Vehicle",
            "Attention, ceci est irréversible. Toutes les données associées seront perdues.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await VehicleService.deleteVehicle(vehicle)
                        onClose()
                    }
                }
            ]
        )
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/80">
                <View className="bg-neutral-900 p-6 rounded-t-3xl border-t border-neutral-700 max-h-[90%]">
                    <Text className="text-2xl font-bold text-white mb-4">
                        {vehicle ? 'Edit Machine' : 'New Machine'}
                    </Text>

                    {/* Brand Autocomplete */}
                    <AutocompleteInput
                        label="Brand"
                        value={brand}
                        onChangeText={setBrand}
                        options={BRANDS.filter(b => b !== 'Other')} // Exclude "Other" from suggestions
                        onSelect={handleBrandSelect}
                        placeholder="Type brand name (e.g. Honda, Yamaha...)"
                        filterMode="startsWith"
                    />

                    {/* Model Autocomplete - shows after brand is selected */}
                    <AutocompleteInput
                        label="Model"
                        value={model}
                        onChangeText={setModel}
                        options={availableModels}
                        onSelect={handleModelSelect}
                        placeholder={brand ? `Type model name...` : "Select brand first"}
                    />

                    {/* Year and Mileage */}
                    <View className="flex-row gap-4 mb-3 mt-3">
                        <TextInput
                            placeholder="Year"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            className="bg-neutral-800 text-white p-3 rounded-xl text-lg flex-1"
                            value={year}
                            onChangeText={setYear}
                        />
                        <TextInput
                            placeholder="Mileage (km)"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            className="bg-neutral-800 text-white p-3 rounded-xl text-lg flex-1"
                            value={mileage}
                            onChangeText={setMileage}
                        />
                    </View>

                    <TextInput
                        placeholder="VIN (Optional)"
                        placeholderTextColor="#666"
                        className="bg-neutral-800 text-white p-3 rounded-xl mb-4 text-lg"
                        value={vin}
                        onChangeText={setVin}
                    />

                    <TouchableOpacity onPress={handleSubmit} className="bg-yellow-500 p-4 rounded-xl items-center mb-3">
                        <Text className="text-black font-bold text-lg">
                            {vehicle ? 'Save Changes' : 'Add to Garage'}
                        </Text>
                    </TouchableOpacity>

                    {vehicle && (
                        <TouchableOpacity onPress={handleDelete} className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl items-center mb-3">
                            <Text className="text-red-500 font-bold text-lg">Delete Vehicle</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={onClose} className="p-3 items-center">
                        <Text className="text-neutral-500 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}


import { useVehicle } from '../../../src/context/VehicleContext'

const GarageScreen = ({ vehicles }: { vehicles: Vehicle[] }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const router = useRouter()
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()

    const openAddModal = () => {
        setEditingVehicle(null)
        setModalVisible(true)
    }

    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        setModalVisible(true)
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />
            <View className="p-6">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-bold text-white">Garage</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setSelectedVehicleId(null)}
                            className={`p-2 rounded-full w-10 h-10 items-center justify-center border ${selectedVehicleId === null
                                ? 'bg-yellow-500 border-yellow-500'
                                : 'bg-neutral-800 border-neutral-700'
                                }`}
                        >
                            <Text className={`font-bold text-xs ${selectedVehicleId === null ? 'text-black' : 'text-white'
                                }`}>ALL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openAddModal} className="bg-neutral-800 p-2 rounded-full w-10 h-10 items-center justify-center border border-neutral-700">
                            <Text className="text-white font-bold text-2xl">+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={vehicles}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View className={selectedVehicleId === item.id ? "border-2 border-yellow-500 rounded-xl relative" : ""}>
                            <VehicleItem
                                vehicle={item}
                                onPress={(vehicle: Vehicle) => {
                                    setSelectedVehicleId(vehicle.id)
                                }}
                            />
                            {selectedVehicleId === item.id && (
                                <TouchableOpacity
                                    onPress={() => openEditModal(item)}
                                    className="absolute top-2 right-2 bg-neutral-900/80 p-2 rounded-lg border border-neutral-700 z-10"
                                >
                                    <Text className="text-white text-xs font-bold">EDIT</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-neutral-500 text-lg">No motorcycles yet.</Text>
                            <Text className="text-neutral-700 text-sm mt-2">Add your first ride to start tracking.</Text>
                        </View>
                    }
                />

                <VehicleModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    vehicle={editingVehicle}
                />
            </View>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
}))

export default enhance(GarageScreen)

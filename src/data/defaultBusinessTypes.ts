import { BusinessType } from '../types';

export const RAW_DEFAULT_CSV = `business_id,business_type_name,online_or_onsite,place,approximately_area,popularity
BUS-0001,3D Printing Bureau,Hybrid,Industrial Zone,250 m2,High
BUS-0002,3D Scan & Modeling Studio,Hybrid,Business Center,80 m2,Medium
BUS-0003,Academic Tutoring Center,Hybrid,First Floor,120 m2,High
BUS-0004,Accounting & Tax Advisory,Hybrid,Business Center,150 m2,High
BUS-0005,Acupuncture & Wellness Clinic,Onsite,First Floor,90 m2,Medium
BUS-0006,Actuarial Consulting Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),Medium
BUS-0007,AdTech Infrastructure Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0008,Aerial Photography Service,Hybrid,Commercial Building,60 m2,Medium
BUS-0009,Aerial Yoga Studio,Onsite,First Floor,180 m2,High
BUS-0010,AI & Machine Learning Lab,Hybrid,Business Center,400 m2,Very High
BUS-0011,Aircraft Maintenance Hangar,Onsite,Industrial Zone,5000 m2,Medium
BUS-0012,Alternative Energy Consultancy,Hybrid,Business Center,200 m2,High
BUS-0013,Ambulance & Medical Transport,Onsite,Standalone Building,600 m2,High
BUS-0014,Amusement Park,Onsite,Empty Area,15000 m2,Very High
BUS-0015,Animal Shelter & Sanctuary,Onsite,Empty Area,3000 m2,High
BUS-0016,Animation & VFX Studio,Hybrid,Business Center,350 m2,High
BUS-0017,Antique Restoration Shop,Onsite,First Floor,110 m2,Medium
BUS-0018,Antiques & Collectibles Gallery,Onsite,Historical Building,200 m2,Medium
BUS-0019,API Integration Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0020,Aquatic Sports Center,Onsite,Standalone Building,2500 m2,High
BUS-0021,Arbitration & Mediation Firm,Hybrid,Business Center,180 m2,Medium
BUS-0022,Arborist & Tree Care Service,Onsite,Industrial Zone,400 m2,Medium
BUS-0023,Arcade & Gaming Lounge,Onsite,Shopping Mall,300 m2,Very High
BUS-0024,Architectural Model Studio,Onsite,Commercial Building,150 m2,Medium
BUS-0025,Architecture & Urban Design,Hybrid,Business Center,280 m2,High
BUS-0026,Aromatherapy & Essential Oils Shop,Hybrid,Shopping Mall,45 m2,Medium
BUS-0027,Art Auction House,Onsite,Historical Building,800 m2,High
BUS-0028,Art Gallery & Exhibition Space,Onsite,First Floor,350 m2,High
BUS-0029,Art Supplies Depot,Onsite,First Floor,220 m2,Medium
BUS-0030,Artisan Bakery,Onsite,First Floor,95 m2,Very High
BUS-0031,Artisan Cheese Shop,Onsite,First Floor,50 m2,High
BUS-0032,Artisan Glassblowing Studio,Onsite,Industrial Zone,180 m2,Medium
BUS-0033,Artisan Leather Goods Shop,Hybrid,Historical Building,70 m2,High
BUS-0034,Artisan Pottery Studio,Onsite,First Floor,110 m2,Medium
BUS-0035,Artisanal Chocolate Shop,Hybrid,First Floor,65 m2,Very High
BUS-0036,Asset Management Firm,Hybrid,Business Center,450 m2,High
BUS-0037,Astro-Tourism Observatory,Onsite,Empty Area,1200 m2,Medium
BUS-0038,Audio Equipment Rental,Hybrid,Industrial Zone,300 m2,Medium
BUS-0039,Auto Body Repair & Paint,Onsite,Industrial Zone,850 m2,High
BUS-0040,Auto Salvage & Recycling,Onsite,Empty Area,4000 m2,Medium
BUS-0041,Auto Tuning & Performance Studio,Onsite,Industrial Zone,600 m2,High
BUS-0042,Automated Express Car Wash,Onsite,Empty Area,700 m2,Very High
BUS-0043,Autonomous Vehicle Software Lab,Hybrid,Business Center,600 m2,High
BUS-0044,Aviation Flight School,Onsite,Standalone Building,1500 m2,High
BUS-0045,Axe Throwing Lounge,Onsite,Commercial Building,250 m2,High
BUS-0046,Baby & Children Boutique,Hybrid,Shopping Mall,85 m2,High
BUS-0047,Bagel & Breakfast Deli,Onsite,First Floor,75 m2,Very High
BUS-0048,Balloon & Event Decor,Hybrid,Commercial Building,90 m2,Medium
BUS-0049,Bank Branch & ATM Center,Onsite,First Floor,300 m2,High
BUS-0050,Barbershop & Men's Grooming,Onsite,First Floor,60 m2,Very High
BUS-0051,Barre Fitness Studio,Onsite,First Floor,140 m2,High
BUS-0052,BBQ Smokehouse & Restaurant,Onsite,Standalone Building,280 m2,Very High
BUS-0053,Bicycle Repair & Retail Shop,Hybrid,First Floor,110 m2,High
BUS-0054,Billiards & Pool Hall,Onsite,Basement Level,450 m2,Medium
BUS-0055,Biohazard Remediation Services,Onsite,Industrial Zone,200 m2,Low
BUS-0056,Bioinformatics Software Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),Medium
BUS-0057,Biometric Security Solutions,Hybrid,Business Center,220 m2,High
BUS-0058,Biotechnology Research Lab,Onsite,Industrial Zone,1200 m2,High
BUS-0059,Bitumen & Asphalt Paving,Onsite,Industrial Zone,1500 m2,Medium
BUS-0060,Blockchain Engineering Studio,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0061,Board Game Cafe,Onsite,First Floor,130 m2,Very High
BUS-0062,Boarding Kennel & Pet Hotel,Onsite,Empty Area,1000 m2,High
BUS-0063,Boat Repair & Maintenance,Onsite,Marina Pier,800 m2,Medium
BUS-0064,Boba Tea & Dessert Lounge,Onsite,Shopping Mall,50 m2,Very High
BUS-0065,Botanical Garden & Conservatory,Onsite,Park Street,8000 m2,High
BUS-0066,Boutique Fashion Emporium,Hybrid,First Floor,120 m2,High
BUS-0067,Boutique Hotel & Beach Resort,Onsite,Beach,5000 m2,Very High
BUS-0068,Bowling Alley & Entertainment,Onsite,Shopping Mall,1800 m2,High
BUS-0069,Boxing Gym & Academy,Onsite,Basement Level,320 m2,High
BUS-0070,Brand Strategy Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),Medium
BUS-0071,Brass & Metal Foundry,Onsite,Industrial Zone,2200 m2,Low
BUS-0072,Bridal & Formal Wear Boutique,Onsite,First Floor,180 m2,High
BUS-0073,Broadcast Television Studio,Onsite,Standalone Building,2000 m2,Medium
BUS-0074,Building Inspection Services,Hybrid,Commercial Building,70 m2,Medium
BUS-0075,Business Appraisal Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Low
BUS-0076,Business Intelligence Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0077,Business Process Outsourcing (BPO),Hybrid,Business Center,1200 m2,High
BUS-0078,Cabaret & Dinner Theater,Onsite,Commercial Building,500 m2,Medium
BUS-0079,Cabinetry & Fine Woodworking,Onsite,Industrial Zone,450 m2,Medium
BUS-0080,Calibration Laboratory,Onsite,Industrial Zone,300 m2,Low
BUS-0081,Call Center Services,Hybrid,Business Center,800 m2,High
BUS-0082,Camera & Gear Rental Hub,Hybrid,Commercial Building,140 m2,High
BUS-0083,Camping & Outdoor Outfitter,Hybrid,First Floor,350 m2,High
BUS-0084,Cancer Treatment Center,Onsite,Standalone Building,3500 m2,Very High
BUS-0085,Candy & Confectionery Shop,Onsite,Shopping Mall,65 m2,High
BUS-0086,Canine Agility Training Center,Onsite,Empty Area,1500 m2,Medium
BUS-0087,Capital Management Firm,Hybrid,Business Center,500 m2,High
BUS-0088,Car Audio & Electronics Shop,Onsite,First Floor,130 m2,Medium
BUS-0089,Car Detailing & Paint Protection,Onsite,Underground Parking,250 m2,Very High
BUS-0090,Car Rental Agency,Hybrid,First Floor,400 m2,High
BUS-0091,Car Wash & Detailing Hub,Onsite,Empty Area,500 m2,High
BUS-0092,Car Wrap & Graphics Studio,Onsite,Industrial Zone,280 m2,High
BUS-0093,Card & Comic Book Shop,Hybrid,First Floor,85 m2,Medium
BUS-0094,Catering & Banquet Services,Hybrid,Industrial Zone,400 m2,High
BUS-0095,Cellular Repair & Accessories,Onsite,Shopping Mall,35 m2,Very High
BUS-0096,Ceramic Tile & Stone Showroom,Onsite,Commercial Building,450 m2,Medium
BUS-0097,Chemical Processing Facility,Onsite,Industrial Zone,6000 m2,Low
BUS-0098,Children's Daycare Center,Onsite,First Floor,350 m2,Very High
BUS-0099,Children's Indoor Play Center,Onsite,Shopping Mall,600 m2,Very High
BUS-0100,Chiropractic Care Clinic,Onsite,First Floor,110 m2,High
BUS-0101,Chocolatier Studio,Hybrid,First Floor,80 m2,High
BUS-0102,Choreography Studio,Onsite,Commercial Building,200 m2,Medium
BUS-0103,Churrascaria Brazilian Steakhouse,Onsite,Standalone Building,650 m2,Very High
BUS-0104,Cider Brewery & Taproom,Onsite,Industrial Zone,500 m2,High
BUS-0105,Cinema Multiplex,Onsite,Shopping Mall,3500 m2,Very High
BUS-0106,Civil Engineering Consultancy,Hybrid,Business Center,300 m2,High
BUS-0107,Classic Car Restoration Shop,Onsite,Industrial Zone,900 m2,Medium
BUS-0108,Cleanroom Manufacturing,Onsite,Industrial Zone,1800 m2,Medium
BUS-0109,Clinical Research Organization,Hybrid,Business Center,600 m2,High
BUS-0110,Clothing Alterations & Tailoring,Onsite,First Floor,40 m2,Medium
BUS-0111,Cloud Architecture Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0112,Cloud Kitchen - Italian Cuisine,Online,Industrial Zone,120 m2,High
BUS-0113,Cloud Kitchen - Pizza Express,Online,Basement Level,100 m2,Very High
BUS-0114,Cloud Kitchen - Sushi Bar,Online,Industrial Zone,90 m2,High
BUS-0115,Cocktail Lounge & Bar,Onsite,First Floor,160 m2,Very High
BUS-0116,Coding Boot Camp,Hybrid,Business Center,250 m2,High
BUS-0117,Coffee Roastery & Specialty Cafe,Hybrid,First Floor,180 m2,Very High
BUS-0118,Cold Storage Logistics Facility,Onsite,Industrial Zone,4500 m2,High
BUS-0119,Cold-Pressed Juice Bar,Onsite,Shopping Mall,30 m2,High
BUS-0120,Comedy Club,Onsite,Basement Level,280 m2,High
BUS-0121,Commercial Cleaning Services,Onsite,Commercial Building,150 m2,High
BUS-0122,Commercial Diving Services,Onsite,Marina Pier,300 m2,Low
BUS-0123,Commercial Freight Forwarding,Hybrid,Industrial Zone,1200 m2,High
BUS-0124,Commercial Laundry Facility,Onsite,Industrial Zone,800 m2,High
BUS-0125,Commercial Printing Press,Onsite,Industrial Zone,1000 m2,Medium
BUS-0126,Commercial Real Estate Agency,Hybrid,Business Center,250 m2,High
BUS-0127,Commercial Refrigeration Repair,Onsite,Industrial Zone,200 m2,Medium
BUS-0128,Community Health Center,Onsite,Standalone Building,1200 m2,High
BUS-0129,Compliance & Regulatory Tech,Online,Virtual / Cloud Space,0 m2 (Virtual),Medium
BUS-0130,Custom Neon Sign Studio,Onsite,Industrial Zone,220 m2,High
BUS-0131,Cyber Defense Operation Center,Hybrid,Business Center,500 m2,Very High
BUS-0132,Cybersecurity Consulting Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0133,Dance Academy & Studio,Onsite,First Floor,250 m2,High
BUS-0134,Data Analytics Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0135,Data Center Operations,Onsite,Industrial Zone,5000 m2,High
BUS-0136,Database Administration Services,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0137,Debt Collection Agency,Hybrid,Business Center,200 m2,Low
BUS-0138,Dental Clinic & Surgery,Onsite,First Floor,180 m2,Very High
BUS-0139,Dermatology & Skin Care Center,Onsite,First Floor,220 m2,Very High
BUS-0140,Design Prototyping Workshop,Onsite,Industrial Zone,300 m2,Medium
BUS-0141,Desktop Publishing Services,Online,Virtual / Cloud Space,0 m2 (Virtual),Low
BUS-0142,Dialysis Medical Center,Onsite,Standalone Building,800 m2,High
BUS-0143,Digital Marketing Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0144,Digital Printing Shop,Hybrid,First Floor,90 m2,High
BUS-0145,Dim Sum Restaurant,Onsite,First Floor,350 m2,High
BUS-0146,Direct Mail Marketing Agency,Hybrid,Industrial Zone,400 m2,Low
BUS-0147,Discount Variety Store,Onsite,First Floor,600 m2,Very High
BUS-0148,Diving & Scuba School,Onsite,Beach,250 m2,Medium
BUS-0149,Dog Boarding & Daycare,Onsite,Empty Area,800 m2,High
BUS-0150,Dog Grooming Salon,Onsite,First Floor,70 m2,Very High
BUS-0151,Donut Bakery & Coffee Shop,Onsite,First Floor,85 m2,Very High
BUS-0152,Drone Aerial Cinematography,Hybrid,Commercial Building,80 m2,High
BUS-0153,Drone Repair & Maintenance,Hybrid,Commercial Building,100 m2,Medium
BUS-0154,Dry Cleaning & Laundromat,Onsite,First Floor,110 m2,High
BUS-0155,Dumpling House Restaurant,Onsite,First Floor,120 m2,High
BUS-0156,E-Commerce Fulfillment Center,Hybrid,Industrial Zone,3500 m2,Very High
BUS-0157,E-Commerce Platform Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0158,Ear Nose Throat (ENT) Clinic,Onsite,Business Center,160 m2,High
BUS-0159,Earthmoving & Excavation,Onsite,Industrial Zone,2000 m2,Medium
BUS-0160,Eco-Friendly Dry Cleaner,Onsite,First Floor,95 m2,High
BUS-0161,EdTech Platform Solutions,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0162,Elder Care & Assisted Living,Onsite,Standalone Building,2800 m2,High
BUS-0163,Electric Bicycle Shop,Hybrid,First Floor,150 m2,High
BUS-0164,Electric Vehicle Charging Station Hub,Onsite,Empty Area,400 m2,Very High
BUS-0165,Electrical Contracting Services,Onsite,Industrial Zone,350 m2,High
BUS-0166,Electroplating & Metal Finishing,Onsite,Industrial Zone,800 m2,Low
BUS-0167,Elevator Maintenance Services,Onsite,Industrial Zone,400 m2,High
BUS-0168,Embedded Systems Design Lab,Hybrid,Business Center,180 m2,Medium
BUS-0169,Emergency Medical Services Hub,Onsite,Standalone Building,1000 m2,Very High
BUS-0170,Endangered Species Sanctuary,Onsite,Empty Area,25000 m2,Medium
BUS-0171,Endocrinology Clinic,Onsite,Business Center,140 m2,Medium
BUS-0172,Environmental Impact Agency,Hybrid,Business Center,200 m2,Medium
BUS-0173,Environmental Remediation Services,Onsite,Industrial Zone,600 m2,Medium
BUS-0174,Equestrian Riding Center,Onsite,Empty Area,12000 m2,Medium
BUS-0175,Equipment Rental Depot,Onsite,Industrial Zone,1500 m2,High
BUS-0176,ER & Urgent Care Center,Onsite,Standalone Building,1800 m2,Very High
BUS-0177,ERP Software Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0178,Escape Room Entertainment,Onsite,Basement Level,350 m2,High
BUS-0179,eSports Arena & Studio,Onsite,Commercial Building,800 m2,Very High
BUS-0180,Essential Oils Distillery,Onsite,Industrial Zone,600 m2,Medium
BUS-0181,Event Lighting & Audio Service,Onsite,Industrial Zone,450 m2,High
BUS-0182,Event Planning Agency,Hybrid,Business Center,110 m2,High
BUS-0183,Executive Headhunting Firm,Hybrid,Business Center,150 m2,High
BUS-0184,Exotic Car Rental Agency,Onsite,Commercial Building,600 m2,High
BUS-0185,Eye Care & Optometry Clinic,Onsite,First Floor,130 m2,High
BUS-0186,Falconry Experience Center,Onsite,Empty Area,5000 m2,Low
BUS-0187,Family Law Practice,Hybrid,Business Center,160 m2,High
BUS-0188,Farm Machinery Repair,Onsite,Industrial Zone,1200 m2,Medium
BUS-0189,Farm-to-Table Restaurant,Onsite,Standalone Building,320 m2,Very High
BUS-0190,Fashion Design Studio,Hybrid,Commercial Building,180 m2,High
BUS-0191,Fast Food Drive-Thru,Onsite,Standalone Building,250 m2,Very High
BUS-0192,Fencing Sports Academy,Onsite,Commercial Building,300 m2,Medium
BUS-0193,Film Editing & Post Production,Hybrid,Business Center,150 m2,High
BUS-0194,Film Equipment Rental,Onsite,Industrial Zone,500 m2,High
BUS-0195,Film Production Studio,Onsite,Industrial Zone,2500 m2,High
BUS-0196,Financial Auditing Agency,Hybrid,Business Center,300 m2,High
BUS-0197,Fine Art Gallery,Onsite,First Floor,250 m2,High
BUS-0198,Fine Dining Seafood Restaurant,Onsite,Sea,450 m2,Very High
BUS-0199,Fine Dining Steakhouse,Onsite,Standalone Building,500 m2,Very High
BUS-0200,Fine Jewelry Boutique,Onsite,Shopping Mall,80 m2,High
BUS-0201,Fire Protection Engineering,Hybrid,Business Center,220 m2,High
BUS-0202,Firearm Safety Training & Range,Onsite,Standalone Building,800 m2,Medium
BUS-0203,Fireplace & Hearth Showroom,Onsite,Commercial Building,300 m2,Medium
BUS-0204,Fishmonger & Seafood Market,Onsite,First Floor,90 m2,High
BUS-0205,Fitness Gym & Crossfit Center,Onsite,Basement Level,1200 m2,Very High
BUS-0206,Flea Market Operator,Onsite,Empty Area,6000 m2,High
BUS-0207,Fleet Management Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0208,Flight Simulator Center,Onsite,Shopping Mall,200 m2,High
BUS-0209,Floatation Therapy Center,Onsite,First Floor,160 m2,High
BUS-0210,Floating Restaurant,Onsite,Sea,380 m2,Very High
BUS-0211,Flooring & Carpet Showroom,Onsite,Commercial Building,400 m2,Medium
BUS-0212,Floral Design Studio,Hybrid,First Floor,85 m2,High
BUS-0213,Flower & Plant Nursery,Onsite,Empty Area,3500 m2,High
BUS-0214,Fluid Power & Hydraulics Repair,Onsite,Industrial Zone,600 m2,Medium
BUS-0215,Food Truck - Gourmet Burgers,Onsite,Park Street,18 m2,Very High
BUS-0216,Food Truck - Ice Cream,Onsite,Beach,15 m2,Very High
BUS-0217,Food Truck - Tacos,Onsite,Pedestrian Zone,18 m2,Very High
BUS-0218,Footwear Customization Studio,Hybrid,First Floor,60 m2,Medium
BUS-0219,Foreign Exchange Bureau,Onsite,First Floor,30 m2,High
BUS-0220,Foreign Language Academy,Hybrid,Commercial Building,200 m2,High
BUS-0221,Forensic Accounting Firm,Hybrid,Business Center,180 m2,Medium
BUS-0222,Freight & Cargo Logistics,Hybrid,Industrial Zone,2000 m2,High
BUS-0223,French Bakery & Patisserie,Onsite,First Floor,110 m2,Very High
BUS-0224,Frozen Yogurt Shop,Onsite,Shopping Mall,45 m2,High
BUS-0225,Furniture Restoration Shop,Onsite,Industrial Zone,250 m2,Medium
BUS-0226,Game Audio Design Studio,Hybrid,Business Center,120 m2,Medium
BUS-0227,Game Development Studio,Hybrid,Business Center,400 m2,Very High
BUS-0228,Garage Door Installation,Onsite,Industrial Zone,200 m2,Medium
BUS-0229,Garden Center & Landscaping,Onsite,Empty Area,2500 m2,High
BUS-0230,Gastropub & Craft Brewery,Onsite,First Floor,350 m2,Very High
BUS-0231,Gelato Parlor,Onsite,Pedestrian Zone,50 m2,Very High
BUS-0232,Gemological Testing Lab,Onsite,Business Center,90 m2,Low
BUS-0233,Genealogical Research Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),Low
BUS-0234,General Practice Medical Clinic,Onsite,First Floor,250 m2,Very High
BUS-0235,Geospatial & GIS Mapping,Online,Virtual / Cloud Space,0 m2 (Virtual),Medium
BUS-0236,Glass & Mirror Studio,Onsite,Industrial Zone,300 m2,Medium
BUS-0237,Glassware Manufacturing,Onsite,Industrial Zone,2000 m2,Low
BUS-0238,Golf Course & Country Club,Onsite,Empty Area,50000 m2,Very High
BUS-0239,Gourmet Delicatessen,Onsite,First Floor,120 m2,High
BUS-0240,Gourmet Olive Oil & Vinegar,Hybrid,First Floor,60 m2,Medium
BUS-0241,Gourmet Spice & Seasoning Shop,Hybrid,First Floor,55 m2,Medium
BUS-0242,Graphic Design Studio,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0243,Green Energy Systems Installation,Onsite,Industrial Zone,400 m2,High
BUS-0244,Greenhouse & Hydroponics,Onsite,Empty Area,4000 m2,High
BUS-0245,Gymnastics Training Center,Onsite,Standalone Building,1000 m2,High
BUS-0246,Hair Extension & Wig Boutique,Hybrid,First Floor,70 m2,Medium
BUS-0247,Hair Salon & Styling Studio,Onsite,First Floor,90 m2,Very High
BUS-0248,Hawaiian Poke Bowl Bar,Onsite,First Floor,65 m2,Very High
BUS-0249,Hazardous Material Disposal,Onsite,Industrial Zone,1500 m2,Low
BUS-0250,Health Food & Supplement Shop,Hybrid,Shopping Mall,110 m2,High
BUS-0251,HealthTech Software Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0252,Hearing Aid & Audiology Clinic,Onsite,First Floor,100 m2,Medium
BUS-0253,Heavy Machinery Repair,Onsite,Industrial Zone,2500 m2,Medium
BUS-0254,Helicopter Charter Service,Onsite,Standalone Building,3000 m2,Medium
BUS-0255,Herbal Medicine Apothecary,Hybrid,First Floor,60 m2,Medium
BUS-0256,High-End Watch Boutique,Onsite,Shopping Mall,90 m2,High
BUS-0257,Historical Museum,Onsite,Historical Building,2000 m2,High
BUS-0258,Holistic Health & Wellness Center,Onsite,First Floor,150 m2,High
BUS-0259,Home Automation Integrator,Hybrid,Commercial Building,180 m2,High
BUS-0260,Home Health Care Agency,Hybrid,Business Center,120 m2,Very High
BUS-0261,Home Inspection Agency,Hybrid,Commercial Building,80 m2,High
BUS-0262,Hookah Lounge & Cafe,Onsite,First Floor,200 m2,High
BUS-0263,Horse Boarding Stable,Onsite,Empty Area,10000 m2,Medium
BUS-0264,Hospice Care Facility,Onsite,Standalone Building,3000 m2,High
BUS-0265,Hospital & Medical Center,Onsite,Standalone Building,15000 m2,Very High
BUS-0266,Hostel & Backpacker Lodge,Onsite,Historical Building,800 m2,High
BUS-0267,Hot Air Balloon Charter,Onsite,Empty Area,5000 m2,Medium
BUS-0268,Hot Yoga Studio,Onsite,First Floor,160 m2,High
BUS-0269,Hotel & Convention Center,Onsite,Standalone Building,20000 m2,Very High
BUS-0270,HVAC Installation & Repair,Onsite,Industrial Zone,350 m2,Very High
BUS-0271,Hydraulic Equipment Supply,Onsite,Industrial Zone,500 m2,Medium
BUS-0272,Hyperbaric Oxygen Therapy Center,Onsite,Commercial Building,180 m2,Medium
BUS-0273,Ice Cream Parlor,Onsite,Pedestrian Zone,40 m2,Very High
BUS-0274,Ice Skating Rink,Onsite,Standalone Building,2500 m2,High
BUS-0275,Image Consulting Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Low
BUS-0276,Immigration Law Agency,Hybrid,Business Center,140 m2,High
BUS-0277,Import Export Consultancy,Hybrid,Business Center,200 m2,High
BUS-0278,Indoor Climbing Gym,Onsite,Standalone Building,1500 m2,High
BUS-0279,Indoor Go-Kart Track,Onsite,Industrial Zone,4000 m2,Very High
BUS-0280,Indoor Playland & Arcade,Onsite,Shopping Mall,1000 m2,Very High
BUS-0281,Indoor Skydiving Wind Tunnel,Onsite,Standalone Building,1200 m2,High
BUS-0282,Indoor Trampoline Park,Onsite,Industrial Zone,2200 m2,Very High
BUS-0283,Industrial Automation Agency,Hybrid,Business Center,350 m2,High
BUS-0284,Industrial Chemical Supplier,Onsite,Industrial Zone,3000 m2,Medium
BUS-0285,Industrial Cleaning Services,Onsite,Industrial Zone,400 m2,High
BUS-0286,Industrial Coating & Painting,Onsite,Industrial Zone,800 m2,Medium
BUS-0287,Industrial Design Agency,Hybrid,Business Center,180 m2,High
BUS-0288,Industrial Logistics Hub,Onsite,Industrial Zone,10000 m2,Very High
BUS-0289,Industrial Packaging Solutions,Onsite,Industrial Zone,1500 m2,Medium
BUS-0290,Industrial Recycling Facility,Onsite,Industrial Zone,8000 m2,High
BUS-0291,Industrial Robotics Assembly,Onsite,Industrial Zone,2500 m2,High
BUS-0292,Industrial Testing Laboratory,Onsite,Industrial Zone,600 m2,Medium
BUS-0293,Infectious Disease Clinic,Onsite,Standalone Building,500 m2,Medium
BUS-0294,Infrared Sauna Lounge,Onsite,First Floor,120 m2,High
BUS-0295,Insulation Contracting,Onsite,Industrial Zone,300 m2,Medium
BUS-0296,InsurTech Platform Developer,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0297,Intellectual Property Law Firm,Hybrid,Business Center,220 m2,High
BUS-0298,Interior Design Studio,Hybrid,Commercial Building,150 m2,High
BUS-0299,International Freight Forwarding,Hybrid,Industrial Zone,1800 m2,High
BUS-0300,Investigation & Detective Agency,Hybrid,Business Center,90 m2,Medium
BUS-0301,IoT Solutions Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0302,Irrigation System Services,Onsite,Industrial Zone,350 m2,Medium
BUS-0303,IT Asset Management Firm,Hybrid,Business Center,250 m2,High
BUS-0304,IT Managed Service Provider (MSP),Hybrid,Business Center,300 m2,Very High
BUS-0305,IV Hydration Therapy Clinic,Onsite,First Floor,90 m2,High
BUS-0306,Izakaya Japanese Pub,Onsite,First Floor,140 m2,Very High
BUS-0307,Janitorial Services Agency,Onsite,Industrial Zone,200 m2,High
BUS-0308,Japanese Ramen Bar,Onsite,First Floor,95 m2,Very High
BUS-0309,Jet Ski Rental & Repair,Onsite,Beach,150 m2,High
BUS-0310,Jewelry Repair & Custom Design,Onsite,Shopping Mall,45 m2,High
BUS-0311,Juice & Smoothie Bar,Onsite,Shopping Mall,35 m2,Very High
BUS-0312,K-Beauty Cosmetics Shop,Hybrid,Shopping Mall,75 m2,High
BUS-0313,Karaoke Lounge & Bar,Onsite,Basement Level,300 m2,Very High
BUS-0314,Kennel & Pet Boarding Hub,Onsite,Empty Area,1200 m2,High
BUS-0315,Kitchen & Bath Showroom,Onsite,Commercial Building,500 m2,High
BUS-0316,Korean BBQ Restaurant,Onsite,First Floor,300 m2,Very High
BUS-0317,Land Surveying Firm,Hybrid,Commercial Building,150 m2,Medium
BUS-0318,Landscape Architecture Agency,Hybrid,Business Center,180 m2,High
BUS-0319,Landscaping & Hardscaping,Onsite,Industrial Zone,500 m2,High
BUS-0320,Language Translation Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0321,Laser Cutting & Engraving,Onsite,Industrial Zone,250 m2,High
BUS-0322,Laser Hair Removal Clinic,Onsite,First Floor,110 m2,Very High
BUS-0323,Laundromat & Wash Services,Onsite,First Floor,85 m2,High
BUS-0324,Law Firm & Legal Services,Hybrid,Business Center,350 m2,High
BUS-0325,Leather Tanning & Crafting,Onsite,Industrial Zone,600 m2,Low
BUS-0326,LegalTech Platform Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0327,Library & Cultural Center,Onsite,Standalone Building,2500 m2,High
BUS-0328,Lighting Design & Equipment,Onsite,Commercial Building,300 m2,Medium
BUS-0329,Limousine & Chauffeur Service,Onsite,Commercial Building,400 m2,High
BUS-0330,Live Event Production Company,Hybrid,Industrial Zone,600 m2,High
BUS-0331,Live Streaming Studio,Hybrid,Commercial Building,150 m2,High
BUS-0332,Locksmith & Security Services,Onsite,First Floor,50 m2,High
BUS-0333,Loss Adjusting Agency,Hybrid,Business Center,120 m2,Low
BUS-0334,Low-Code Platform Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0335,Luggage & Travel Accessories,Hybrid,Shopping Mall,100 m2,Medium
BUS-0336,Luxury Yacht Charter,Onsite,Marina Pier,500 m2,Very High
BUS-0337,Machining & CNC Fabrication,Onsite,Industrial Zone,800 m2,High
BUS-0338,Magic & Illusion Venue,Onsite,Commercial Building,200 m2,Medium
BUS-0339,Marble & Granite Countertop Studio,Onsite,Industrial Zone,700 m2,High
BUS-0340,Marine Engine Maintenance,Onsite,Marina Pier,450 m2,Medium
BUS-0341,Market Research Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0342,Martial Arts Dojo,Onsite,First Floor,220 m2,High
BUS-0343,Massage Therapy Clinic,Onsite,First Floor,100 m2,Very High
BUS-0344,Matcha Specialty Cafe,Onsite,First Floor,55 m2,Very High
BUS-0345,Materials Testing Lab,Onsite,Industrial Zone,400 m2,Medium
BUS-0346,Maternity & Neonatal Clinic,Onsite,Standalone Building,1200 m2,High
BUS-0347,Mattress Specialty Store,Onsite,Commercial Building,400 m2,High
BUS-0348,Meat Butchery & Delicatessen,Onsite,First Floor,95 m2,Very High
BUS-0349,Media Buying Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0350,Medical Equipment Supplier,Hybrid,Industrial Zone,600 m2,High
BUS-0351,Medical Imaging Center,Onsite,Standalone Building,800 m2,Very High
BUS-0352,Medical Spa & Aesthetics,Onsite,First Floor,180 m2,Very High
BUS-0353,Mediterranean Restaurant,Onsite,First Floor,220 m2,Very High
BUS-0354,Mental Health Therapy Clinic,Hybrid,Business Center,140 m2,Very High
BUS-0355,Metal Fabrication Workshop,Onsite,Industrial Zone,1000 m2,High
BUS-0356,Micro-Roastery Coffee Bar,Hybrid,First Floor,80 m2,Very High
BUS-0357,Microbrewery & Taproom,Onsite,Industrial Zone,600 m2,Very High
BUS-0358,Microservices Architecture Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0359,Military Surplus Store,Onsite,First Floor,180 m2,Medium
BUS-0360,Miniature Golf Course,Onsite,Empty Area,3000 m2,High
BUS-0361,Mobile App Development Studio,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0362,Mobile Auto Repair,Onsite,Industrial Zone,150 m2,High
BUS-0363,Mobile Car Detailing,Onsite,Underground Parking,80 m2,Very High
BUS-0364,Mobile Laser Tag Arena,Onsite,Empty Area,1000 m2,Medium
BUS-0365,Mobile Locksmith Services,Onsite,Commercial Building,40 m2,High
BUS-0366,Mobile Tire Service,Onsite,Industrial Zone,120 m2,High
BUS-0367,Modeling & Talent Agency,Hybrid,Business Center,200 m2,High
BUS-0368,Montessori Preschool,Onsite,Standalone Building,800 m2,Very High
BUS-0369,Mortgage Brokerage Firm,Hybrid,Business Center,160 m2,High
BUS-0370,Motorcycle Repair & Customization,Onsite,Industrial Zone,300 m2,High
BUS-0371,Moving & Relocation Services,Onsite,Industrial Zone,800 m2,High
BUS-0372,Multi-Specialty Medical Group,Onsite,Standalone Building,3000 m2,Very High
BUS-0373,Music Academy & School,Onsite,Commercial Building,250 m2,High
BUS-0374,Music Conservatory,Onsite,Standalone Building,1500 m2,High
BUS-0375,Music Festival Organizer,Hybrid,Business Center,300 m2,High
BUS-0376,Music Publishing Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Medium
BUS-0377,Musical Instrument Retail & Repair,Hybrid,First Floor,200 m2,High
BUS-0378,Nail Art & Manicure Lounge,Onsite,First Floor,70 m2,Very High
BUS-0379,Nanotechnology Research Lab,Onsite,Industrial Zone,1500 m2,Medium
BUS-0380,National Freight Logistics,Hybrid,Industrial Zone,5000 m2,Very High
BUS-0381,Neapolitan Pizzeria,Onsite,First Floor,150 m2,Very High
BUS-0382,Neon Sign Manufacturing,Onsite,Industrial Zone,350 m2,Medium
BUS-0383,Network Infrastructure Agency,Hybrid,Business Center,250 m2,High
BUS-0384,Neurological Medical Clinic,Onsite,Business Center,200 m2,High
BUS-0385,Newspaper Publishing House,Hybrid,Commercial Building,800 m2,Medium
BUS-0386,Novelty & Souvenir Shop,Onsite,Pedestrian Zone,60 m2,High
BUS-0387,Nuclear Medicine Clinic,Onsite,Standalone Building,1000 m2,Medium
BUS-0388,Nursery & Botanical Supply,Onsite,Empty Area,4000 m2,High
BUS-0389,Nursing Agency & Staffing,Hybrid,Business Center,150 m2,High
BUS-0390,Nutrition & Dietetics Practice,Hybrid,Business Center,80 m2,High
BUS-0391,Obstetrics & Gynecology Clinic,Onsite,Business Center,220 m2,Very High
BUS-0392,Occupational Health Center,Onsite,Business Center,300 m2,High
BUS-0393,Ocean Freight Agency,Hybrid,Business Center,250 m2,High
BUS-0394,Off-Road Customization Shop,Onsite,Industrial Zone,500 m2,High
BUS-0395,Office Furniture Showroom,Onsite,Commercial Building,800 m2,High
BUS-0396,Office Supplies Retailer,Hybrid,First Floor,250 m2,Medium
BUS-0397,Oil Change & Lube Express,Onsite,Standalone Building,200 m2,Very High
BUS-0398,Online Education Portal,Online,Virtual / Cloud Space,0 m2 (Virtual),Very High
BUS-0399,Onsen & Thermal Bathhouse,Onsite,Standalone Building,2500 m2,High
BUS-0400,Ophthalmology Surgery Center,Onsite,Standalone Building,1200 m2,High
BUS-0401,Optical & Eyewear Boutique,Onsite,First Floor,90 m2,Very High
BUS-0402,Optometry Clinic,Onsite,First Floor,110 m2,High
BUS-0403,Oral & Maxillofacial Surgery,Onsite,Business Center,250 m2,High
BUS-0404,Organic Farmers Market,Onsite,Empty Area,2000 m2,Very High
BUS-0405,Organic Grocery Store,Onsite,First Floor,500 m2,Very High
BUS-0406,Orthodontic Clinic,Onsite,First Floor,160 m2,Very High
BUS-0407,Orthopedic Surgery Center,Onsite,Standalone Building,2000 m2,High
BUS-0408,Outdoor Equipment Outfitter,Hybrid,First Floor,450 m2,High
BUS-0409,Oyster & Seafood Raw Bar,Onsite,Beach,140 m2,Very High
BUS-0410,Packaging Design Agency,Hybrid,Business Center,150 m2,High
BUS-0411,Pain Management Clinic,Onsite,Business Center,200 m2,High
BUS-0412,Paintball & Airsoft Arena,Onsite,Empty Area,5000 m2,High
BUS-0413,Painting Contracting Services,Onsite,Industrial Zone,200 m2,High
BUS-0414,Pallet Manufacturing & Repair,Onsite,Industrial Zone,3000 m2,Medium
BUS-0415,Paper & Cardboard Recycling,Onsite,Industrial Zone,6000 m2,Medium
BUS-0416,Paragliding & Hang Gliding School,Onsite,Empty Area,2000 m2,Medium
BUS-0417,Parking Garage Management,Onsite,Underground Parking,4000 m2,Very High
BUS-0418,Party Rental Supply,Onsite,Industrial Zone,800 m2,High
BUS-0419,Passport & Visa Agency,Hybrid,Business Center,90 m2,High
BUS-0420,Patent Law Agency,Hybrid,Business Center,180 m2,High
BUS-0421,Pathology Laboratory,Onsite,Business Center,350 m2,High
BUS-0422,Paving & Concrete Contractor,Onsite,Industrial Zone,1500 m2,High
BUS-0423,Pawnbroker Shop,Onsite,First Floor,100 m2,High
BUS-0424,Pediatric Medical Clinic,Onsite,First Floor,220 m2,Very High
BUS-0425,Penetration Testing Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0426,Perfumery & Fragrance Studio,Hybrid,First Floor,75 m2,High
BUS-0427,Periodontics Dental Studio,Onsite,Business Center,150 m2,Medium
BUS-0428,Personal Fitness Training,Onsite,First Floor,120 m2,Very High
BUS-0429,Pest Control Services,Onsite,Industrial Zone,250 m2,Very High
BUS-0430,Pet Grooming & Spa,Onsite,First Floor,85 m2,Very High
BUS-0431,Pet Supply Store,Hybrid,First Floor,250 m2,Very High
BUS-0432,Petroleum Wholesale Agency,Hybrid,Business Center,300 m2,Medium
BUS-0433,Pharmaceutical Manufacturing,Onsite,Industrial Zone,8000 m2,Very High
BUS-0434,Pharmacy & Drugstore,Onsite,First Floor,180 m2,Very High
BUS-0435,Photo Printing & Framing,Hybrid,First Floor,80 m2,Medium
BUS-0436,Photography Studio,Onsite,Commercial Building,150 m2,High
BUS-0437,Physical Therapy Clinic,Onsite,First Floor,200 m2,Very High
BUS-0438,Piano Tuning & Restoration,Onsite,Industrial Zone,150 m2,Medium
BUS-0439,Pilates Reformer Studio,Onsite,First Floor,160 m2,Very High
BUS-0440,Pipefitting & Industrial Piping,Onsite,Industrial Zone,800 m2,Medium
BUS-0441,Pizza Delivery & Takeout,Hybrid,First Floor,90 m2,Very High
BUS-0442,Planetarium & Observatory,Onsite,Standalone Building,1800 m2,High
BUS-0443,Plastic Injection Molding,Onsite,Industrial Zone,3000 m2,High
BUS-0444,Plastic Surgery Clinic,Onsite,Standalone Building,600 m2,Very High
BUS-0445,Plumbing & Heating Services,Onsite,Industrial Zone,300 m2,Very High
BUS-0446,Podcast Production Studio,Hybrid,Commercial Building,90 m2,Very High
BUS-0447,Podiatry Care Center,Onsite,First Floor,120 m2,High
BUS-0448,Pole Dance & Fitness Studio,Onsite,First Floor,150 m2,High
BUS-0449,Pop-Up Retail Space,Onsite,Shopping Mall,80 m2,High
BUS-0450,Post-Production Film House,Hybrid,Business Center,300 m2,High
BUS-0451,Power Tool Repair & Retail,Onsite,Industrial Zone,200 m2,Medium
BUS-0452,Precision Laser Engraving,Hybrid,Industrial Zone,150 m2,High
BUS-0453,Private Aviation Charter,Onsite,Standalone Building,2000 m2,High
BUS-0454,Private Detective Agency,Hybrid,Business Center,70 m2,Medium
BUS-0455,Private Equity Investment,Hybrid,Business Center,400 m2,Very High
BUS-0456,Private K-12 Academy,Onsite,Standalone Building,6000 m2,Very High
BUS-0457,Private Security Agency,Hybrid,Business Center,250 m2,Very High
BUS-0458,Process Server Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),Low
BUS-0459,Product Design Consultancy,Hybrid,Business Center,200 m2,High
BUS-0460,Prop & Costume Rental,Onsite,Industrial Zone,600 m2,Medium
BUS-0461,PropTech Software Agency,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0462,Prosthetics & Orthotics Center,Onsite,Business Center,220 m2,High
BUS-0463,Public Relations (PR) Agency,Hybrid,Business Center,180 m2,Very High
BUS-0464,Publishing House,Hybrid,Commercial Building,350 m2,Medium
BUS-0465,Puppet & Animatronics Studio,Onsite,Industrial Zone,250 m2,Low
BUS-0466,Pyrotechnics & Special FX,Onsite,Industrial Zone,1000 m2,Medium
BUS-0467,Quality Assurance Testing Lab,Hybrid,Business Center,200 m2,High
BUS-0468,Quantum Computing Software Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0469,Quick Lube & Oil Change,Onsite,Standalone Building,180 m2,Very High
BUS-0470,Radiology Diagnostic Center,Onsite,Standalone Building,700 m2,Very High
BUS-0471,Rare Book & Manuscript Shop,Hybrid,Historical Building,90 m2,Medium
BUS-0472,Raw Vegan Cafe & Lounge,Onsite,First Floor,110 m2,High
BUS-0473,Real Estate Appraisal Agency,Hybrid,Business Center,120 m2,High
BUS-0474,Real Estate Brokerage,Hybrid,Business Center,300 m2,Very High
BUS-0475,Real Estate Property Management,Hybrid,Business Center,250 m2,Very High
BUS-0476,Recording Studio & Sound Design,Onsite,Basement Level,180 m2,High
BUS-0477,Records Storage & Shredding,Onsite,Industrial Zone,2000 m2,Medium
BUS-0478,Recreation Center,Onsite,Standalone Building,3500 m2,Very High
BUS-0479,Recycling & Waste Management,Onsite,Industrial Zone,10000 m2,Very High
BUS-0480,Refrigeration Contracting,Onsite,Industrial Zone,400 m2,High
BUS-0481,Refurbished Electronics Shop,Hybrid,Shopping Mall,120 m2,Very High
BUS-0482,Regional Airline Carrier,Onsite,Standalone Building,10000 m2,High
BUS-0483,Rehabilitation Hospital,Onsite,Standalone Building,5000 m2,High
BUS-0484,Regulatory Compliance Firm,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0485,Renewable Energy Contractor,Hybrid,Industrial Zone,500 m2,Very High
BUS-0486,Research & Development Lab,Onsite,Industrial Zone,1800 m2,High
BUS-0487,Residential Care Home,Onsite,Standalone Building,1200 m2,High
BUS-0488,Residential Cleaning Services,Onsite,Commercial Building,100 m2,Very High
BUS-0489,Resin Flooring Installation,Onsite,Industrial Zone,250 m2,Medium
BUS-0490,Restaurant Supply Store,Onsite,Industrial Zone,1200 m2,High
BUS-0491,Retro Video Game Store,Hybrid,First Floor,85 m2,High
BUS-0492,Risk Management Consultancy,Online,Virtual / Cloud Space,0 m2 (Virtual),High
BUS-0493,Robotics Integration Firm,Hybrid,Industrial Zone,800 m2,Very High
BUS-0494,Rock Climbing Gym,Onsite,Standalone Building,1800 m2,Very High
BUS-0495,Roller Skating Rink,Onsite,Standalone Building,2000 m2,High
BUS-0496,Roofing & Waterproofing Contractor,Onsite,Industrial Zone,400 m2,Very High
BUS-0497,Rooftop Cocktail Lounge,Onsite,Commercial Building,350 m2,Very High
BUS-0498,RV Rental & Repair Hub,Onsite,Empty Area,4000 m2,High
BUS-0499,Safety Training Academy,Hybrid,Commercial Building,300 m2,High
BUS-0500,Salt Cave Therapy Lounge,Onsite,First Floor,90 m2,Medium
BUS-0501,Software Development,Hybrid,First Floor,1500 m2,High`;

export function parseCSV(csvContent: string): BusinessType[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const results: BusinessType[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Split handling commas inside quotes if any
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    if (cols.length >= 2) {
      const id = cols[0] || `BUS-${String(i).padStart(4, '0')}`;
      const name = cols[1] || 'Unknown Business';
      const mode = (cols[2] || 'Hybrid') as any;
      const place = cols[3] || 'Commercial Area';
      const area = cols[4] || '100 m2';
      const popularity = (cols[5] || 'Medium') as any;

      results.push({
        business_id: id,
        business_type_name: name,
        online_or_onsite: ['Online', 'Onsite', 'Hybrid'].includes(mode) ? mode : 'Hybrid',
        place: place,
        approximately_area: area,
        popularity: ['Low', 'Medium', 'High', 'Very High'].includes(popularity) ? popularity : 'Medium',
      });
    }
  }

  return results;
}

export const DEFAULT_BUSINESS_TYPES: BusinessType[] = parseCSV(RAW_DEFAULT_CSV);

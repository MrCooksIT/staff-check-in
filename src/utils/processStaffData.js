// src/utils/processStaffData.js
const rawStaffData =
    `
1001	Laurene	Abrahams	Admin	debtors@maristsj.co.za
1002	Desiree	Adams	Snr	adamsd@maristsj.co.za
1003	Shaakira	Anthony	Aftercare	santhony@maristsj.co.za
1004	Sonja	Bailey	Aftercare	sbailey@maristsj.co.za
1005	Riaan	Beckles	Estate	estate@maristsj.co.za
1006	Shirley	Blackwell	Jnr	sblackwell@maristsj.co.za
1007	Deborah	Bouch	Snr	dbouch@maristsj.co.za
1008	Natasha	Byne	Aftercare	nbyne@maristsj.co.za
1009	Joshua	Charles	Estate	jcharles@maristsj.co.za
1010	Samantha	Claase	Aftercare	sclaase@maristsj.co.za
1011	Erin	Clark	SNU	eclark@maristsj.co.za
1012	Gwendolene	Clayton	Aftercare	gclayton@maristsj.co.za
1013	Natalie	Cloete	Aftercare	ncloete@maristsj.co.za
1014	Ayden	Coetzee	Snr	acoetzee@maristsj.co.za
1015	Caron	Darby-Michaels	Admin	principal@maristsj.co.za
1016	Natalee	Davis	Aftercare	ndavis@maristsj.co.za
1017	Jaimie	Dowdall	Jnr	jdowdall@maristsj.co.za
1018	Lauren	Du Preez	Jnr	ldupreez@maristsj.co.za
1019	Nicky	Engel	Aftercare	nengel@maristsj.co.za
1020	Ian	Fowkes	Jnr	ifowkes@maristsj.co.za
1021	Anelisa	Gqamana	Snr	agqamana@maristsj.co.za
1022	Jodie	Greeff	Aftercare	jgreeff@maristsj.co.za
1023	Jolene	Greyvenstein	Jnr	jgreyvenstein@maristsj.co.za
1024	Pumza	Gungqayo	Jnr	pgungqayo@maristsj.co.za
1025	Shanade	Hamman-Beukes	Jnr	s.hammanbeukes@maristsj.co.za
1026	Bronwyn	Harrison	SNU	bharrison@maristsj.co.za
1027	Carolyn	Hlava	Jnr	chlava@maristsj.co.za
1028	Mike	Hoare	Snr	mhoare@maristsj.co.za
1029	Kay	Holt	Jnr	kholt@maristsj.co.za
1030	Spencer	Jacobs	Snr	sjacobs@maristsj.co.za
1031	Fathima	Janoo	Unassigned	fjanoo@maristsj.co.za
1033	Nomvuyo	Jonas	Jnr	njonas@maristsj.co.za
1032	Zandile	Jonas	Unassigned	zjonas@maristsj.co.za
1034	Kayla	Keating	Jnr	kkeating@maristsj.co.za
1035	Ronelle	Kemp	Estate	rkemp@maristsj.co.za
1036	Helen	Klopper	Admin	pa@maristsj.co.za
1037	Bianca	Kohler	Jnr	bkohler@maristsj.co.za
1038	Bongi	Kupe	Snr	bkupe@maristsj.co.za
1039	Olwethu	Langa	Admin	olanga@maristsj.co.za
1040	Kerushini	Liddle	Jnr	kliddle@maristsj.co.za
1041	Lucinda	Linewal	Aftercare	llinewal@maristsj.co.za
1042	Jasmin	Louw	Aftercare	jlouw@maristsj.co.za
1043	Heidi	Lucas	Aftercare	hlucas@maristsj.co.za
1044	Nomasapho	Madlebe	Aftercare	nmadlebe@maristsj.co.za
1045	Taryn	Madurai	Snr	tmadurai@maristsj.co.za
1046	Lisa	Martens	Jnr	lmartens@maristsj.co.za
1047	Nicole	May	Jnr	nmay@maristsj.co.za
1048	Samantha	Menas	Jnr	smenas@maristsj.co.za
1049	Mary	Mercer	Snr	mmercer@maristsj.co.za
1050	Joy	Meyer	Aftercare	jmeyer@maristsj.co.za
1051	Pumeza	Mlungu	Jnr	pmlungu@maristsj.co.za
1052	lela	Molotywa	Jnr	lmolotywa@maristsj.co.za
1053	Giselle	Moodley	Snr	gmoodley@maristsj.co.za
1054	Anelet	Moolman	Snr	amoolman@maristsj.co.za
1055	Ayanda	Moya	SNU	amoya@maristsj.co.za
1056	Jacqui	Mulholland	Jnr	jmulholland@maristsj.co.za
1057	Fiona	Naidoo	Jnr	ot@maristsj.co.za
1058	Cheryl	Neeson	Jnr	social@maristsj.co.za
1059	Leandre	Newkirk	Aftercare	lnewkirk@maristsj.co.za
1060	Doris	Nobavu	Jnr	dnobavu@maristsj.co.za
1061	Leo	Nyman	Admin	admin@maristsj.co.za
1062	Pat	Oliver	Aftercare	poliver@maristsj.co.za
1063	Alessandra	Pasensie	Unassigned	apasensie@maristsj.co.za
1064	Vuyiswa	Phakathi	Aftercare	vphakathi@maristsj.co.za
1065	Liam	Quinlivan	Snr	lquinlivan@maristsj.co.za
1066	Tiasha	Ramprasad	Snr	tramprasad@maristsj.co.za
1067	Louise	Rix	Admin	finance@maristsj.co.za
1068	Sean	Robson	Jnr	srobson@maristsj.co.za
1069	Lee	Robyn	Jnr	lrobyn@maristsj.co.za
1070	Christabel	Rooi	Jnr	crooi@maristsj.co.za
1071	Natashia	Rushin	Aftercare	nrushin@maristsj.co.za
1072	Derek	Schaffers	Jnr	dschaffers@maristsj.co.za
1073	Cara	Schultz	Jnr	cschultz@maristsj.co.za
1074	Ebrahim	Shaik	Estate	ebrahim.shaik@maristsj.co.za
1075	Melissa	Shepherd	Snr	mshepherd@maristsj.co.za
1076	Natasha	Skosan	Jnr	nskosan@maristsj.co.za
1077	Shona	Smith	Snr	ssmith@maristsj.co.za
1078	Bianca	Snyman	Snr	bsnyman@maristsj.co.za
1079	Arlene	Solomons	Jnr	asolomons@maristsj.co.za
1080	Lyn	Swartz	Admin	lswartz@maristsj.co.za
1081	Shelley	Turner	Admin	headpa@maristsj.co.za
1082	Sandra	Van Niekerk	Jnr	sandravn@maristsj.co.za
1083	Clare	Wagner	SNU	cwagner@maristsj.co.za
1084	Louis	Wahl	Snr	lwahl@maristsj.co.za
1085	Karen	Walker	Aftercare	kwalker@maristsj.co.za
1086	Hayley-Jane	Wilson	Snr	hjwilson@maristsj.co.za
1087	Jemma	Wright	Jnr	jwright@maristsj.co.za
1088	Peter	Zulu	Snr	pzulu@maristsj.co.za`;

const processStaffData = () => {
    const staffArray = rawStaffData
        .trim()
        .split('\n')
        .map(line => {
            const [id, firstName, lastName, department, email] = line.split('\t');
            return {
                staffId: id,
                firstName,
                lastName,
                department,
                email,
                active: true, // Add additional fields
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
        });

    return staffArray;
};

export const staffData = processStaffData();
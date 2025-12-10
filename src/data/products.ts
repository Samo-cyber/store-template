export interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    image: string;
    description?: string;
}

export const products: Product[] = [
    // Electronics
    {
        id: "101",
        title: "سماعات رأس لاسلكية احترافية",
        price: 3500,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        description: "سماعات رأس عازلة للضوضاء بجودة صوت استوديو."
    },
    {
        id: "102",
        title: "ساعة ذكية رياضية",
        price: 2200,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        description: "تتبع نشاطك الرياضي وصحتك بدقة عالية."
    },
    {
        id: "103",
        title: "كاميرا احترافية DSLR",
        price: 25000,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
        description: "التقط صوراً مذهلة بجودة لا تضاهى."
    },
    {
        id: "104",
        title: "لابتوب للأعمال",
        price: 18500,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
        description: "أداء قوي وتصميم نحيف لزيادة إنتاجيتك."
    },
    {
        id: "105",
        title: "هاتف ذكي حديث",
        price: 12000,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        description: "شاشة رائعة وكاميرا متطورة."
    },
    {
        id: "106",
        title: "تابلت للرسم",
        price: 5500,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
        description: "مثالي للمصممين والفنانين."
    },
    {
        id: "107",
        title: "ماوس ألعاب",
        price: 950,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        description: "دقة عالية وسرعة استجابة للألعاب."
    },
    {
        id: "108",
        title: "لوحة مفاتيح ميكانيكية",
        price: 1800,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=800&q=80",
        description: "تجربة كتابة مريحة وسريعة."
    },
    {
        id: "109",
        title: "شاشة 4K",
        price: 8000,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
        description: "ألوان زاهية وتفاصيل دقيقة."
    },
    {
        id: "110",
        title: "باور بانك سريع الشحن",
        price: 650,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1609592424393-2435724569e0?w=800&q=80",
        description: "اشحن أجهزتك في أي مكان."
    },

    // Fashion
    {
        id: "201",
        title: "جاكيت جلد كلاسيكي",
        price: 1200,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1551028919-ac66e6a39d51?w=800&q=80",
        description: "أناقة لا تنتهي مع الجلد الطبيعي."
    },
    {
        id: "202",
        title: "حذاء رياضي مريح",
        price: 1500,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        description: "مثالي للمشي والجري لمسافات طويلة."
    },
    {
        id: "203",
        title: "تيشيرت قطني سادة",
        price: 250,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        description: "خامة قطنية ناعمة ومريحة."
    },
    {
        id: "204",
        title: "بنطلون جينز أزرق",
        price: 600,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800&q=80",
        description: "جينز عالي الجودة بقصة مريحة."
    },
    {
        id: "205",
        title: "فستان صيفي",
        price: 850,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
        description: "تصميم أنيق وخفيف للصيف."
    },
    {
        id: "206",
        title: "بدلة رسمية",
        price: 3500,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c472958?w=800&q=80",
        description: "للمناسبات الرسمية والعمل."
    },
    {
        id: "207",
        title: "قميص كاروهات",
        price: 450,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
        description: "إطلالة كاجوال عصرية."
    },
    {
        id: "208",
        title: "سكارف شتوي",
        price: 200,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80",
        description: "دفء وأناقة في الشتاء."
    },
    {
        id: "209",
        title: "قبعة شمسية",
        price: 150,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=800&q=80",
        description: "حماية من الشمس بأسلوب مميز."
    },
    {
        id: "210",
        title: "حقيبة يد جلدية",
        price: 1800,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
        description: "تتسع لجميع أغراضك اليومية."
    },

    // Home & Decor
    {
        id: "301",
        title: "مصباح طاولة مودرن",
        price: 450,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1507473888900-52e1adad54ac?w=800&q=80",
        description: "إضاءة هادئة وتصميم عصري."
    },
    {
        id: "302",
        title: "كرسي مريح",
        price: 2500,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80",
        description: "راحة قصوى للاسترخاء والقراءة."
    },
    {
        id: "303",
        title: "نبات زينة داخلي",
        price: 120,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
        description: "أضف لمسة خضراء لمنزلك."
    },
    {
        id: "304",
        title: "طقم أواني طهي",
        price: 3000,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80",
        description: "جودة عالية لطهي أشهى الأطباق."
    },
    {
        id: "305",
        title: "سجادة يدوية",
        price: 1500,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1575414003502-942360c6e3ae?w=800&q=80",
        description: "تصميم فريد يضيف الدفء للغرفة."
    },
    {
        id: "306",
        title: "وسادة ديكور",
        price: 150,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800&q=80",
        description: "ألوان زاهية لتجديد ديكور الصالة."
    },
    {
        id: "307",
        title: "إطار صور خشبي",
        price: 80,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80",
        description: "احتفظ بذكرياتك الجميلة."
    },
    {
        id: "308",
        title: "شموع عطرية",
        price: 90,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1602825266988-75fe51ae490c?w=800&q=80",
        description: "رائحة منعشة واسترخاء تام."
    },
    {
        id: "309",
        title: "ساعة حائط",
        price: 300,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1563861826100-9cb868c72876?w=800&q=80",
        description: "تصميم بسيط وعملي."
    },
    {
        id: "310",
        title: "مزهرية سيراميك",
        price: 200,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=800&q=80",
        description: "لمسة فنية لمنزلك."
    },

    // Accessories
    {
        id: "401",
        title: "نظارة شمسية كلاسيك",
        price: 450,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        description: "حماية وأناقة في آن واحد."
    },
    {
        id: "402",
        title: "محفظة رجالي",
        price: 300,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1627123424574-18bd75f3194c?w=800&q=80",
        description: "جلد طبيعي وتصميم نحيف."
    },
    {
        id: "403",
        title: "ساعة يد نسائية",
        price: 1200,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1508057198894-247b6d788d7a?w=800&q=80",
        description: "تصميم رقيق وجذاب."
    },
    {
        id: "404",
        title: "قلادة فضية",
        price: 600,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80",
        description: "إضافة مميزة لإطلالتك."
    },
    {
        id: "405",
        title: "حقيبة سفر",
        price: 2200,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80",
        description: "متينة وواسعة لجميع رحلاتك."
    },
    {
        id: "406",
        title: "حزام جلد",
        price: 250,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        description: "أناقة كلاسيكية."
    },
    {
        id: "407",
        title: "قبعة شتوية",
        price: 120,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80",
        description: "دفء وأناقة."
    },
    {
        id: "408",
        title: "قفازات جلدية",
        price: 350,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1589363460779-cd717d2ed8fa?w=800&q=80",
        description: "حماية لليدين بأسلوب راقي."
    },
    {
        id: "409",
        title: "ربطة عنق",
        price: 150,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&q=80",
        description: "للمناسبات الرسمية."
    },
    {
        id: "410",
        title: "أزرار أكمام",
        price: 200,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1617117833203-c91b4477d31e?w=800&q=80",
        description: "لمسة نهائية أنيقة."
    },
    // More Electronics
    {
        id: "111",
        title: "ميكروفون بودكاست",
        price: 1500,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
        description: "صوت نقي لتسجيلاتك."
    },
    {
        id: "112",
        title: "راوتر واي فاي سريع",
        price: 1200,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?w=800&q=80",
        description: "تغطية واسعة وسرعة عالية."
    },
    {
        id: "113",
        title: "طابعة ليزر",
        price: 4000,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80",
        description: "طباعة سريعة وواضحة للمستندات."
    },
    {
        id: "114",
        title: "قرص صلب خارجي 1TB",
        price: 900,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1531492253372-e8c9b7155286?w=800&q=80",
        description: "مساحة تخزين إضافية لملفاتك."
    },
    {
        id: "115",
        title: "كاميرا مراقبة ذكية",
        price: 850,
        category: "إلكترونيات",
        image: "https://images.unsplash.com/photo-1557324232-b8917d3c3d63?w=800&q=80",
        description: "راقب منزلك من أي مكان."
    },
    // More Fashion
    {
        id: "211",
        title: "حذاء كعب عالي",
        price: 900,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
        description: "أناقة للمناسبات الخاصة."
    },
    {
        id: "212",
        title: "بيجامة قطنية",
        price: 400,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
        description: "راحة تامة أثناء النوم."
    },
    {
        id: "213",
        title: "شورت سباحة",
        price: 250,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
        description: "استمتع بالبحر والمسبح."
    },
    {
        id: "214",
        title: "جاكيت بليزر",
        price: 1800,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        description: "إطلالة سمارت كاجوال."
    },
    {
        id: "215",
        title: "تنورة طويلة",
        price: 500,
        category: "ملابس",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
        description: "أنوثة وأناقة."
    },
    // More Home
    {
        id: "311",
        title: "طقم ملايات سرير",
        price: 600,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1522771753035-1a5b6562f3ba?w=800&q=80",
        description: "نوم هادئ ومريح."
    },
    {
        id: "312",
        title: "منشفة حمام فاخرة",
        price: 200,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1583562835057-a62d1beffbf3?w=800&q=80",
        description: "نعومة فائقة وامتصاص عالي."
    },
    {
        id: "313",
        title: "سلة غسيل",
        price: 150,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
        description: "تنظيم وعملية."
    },
    {
        id: "314",
        title: "مرآة حائط",
        price: 700,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80",
        description: "توسع المساحة وتضيف جمالاً."
    },
    {
        id: "315",
        title: "رفوف خشبية",
        price: 350,
        category: "منزل",
        image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80",
        description: "عرض تحفك وكتبك بأناقة."
    },
    // More Accessories
    {
        id: "411",
        title: "خاتم ذهبي",
        price: 3000,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
        description: "لمسة من الفخامة."
    },
    {
        id: "412",
        title: "سلسلة مفاتيح جلد",
        price: 80,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1582816247790-da1c0dc1e608?w=800&q=80",
        description: "هدية بسيطة وأنيقة."
    },
    {
        id: "413",
        title: "حقيبة مكياج",
        price: 150,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
        description: "تنظيم مستحضرات التجميل."
    },
    {
        id: "414",
        title: "مظلة مطر",
        price: 200,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80",
        description: "حماية من المطر والشمس."
    },
    {
        id: "415",
        title: "حافظة بطاقات",
        price: 100,
        category: "إكسسوارات",
        image: "https://images.unsplash.com/photo-1627123424574-18bd75f3194c?w=800&q=80",
        description: "سهولة الوصول لبطاقاتك."
    }
];

export function getProductById(id: string): Product | undefined {
    return products.find((product) => product.id === id);
}

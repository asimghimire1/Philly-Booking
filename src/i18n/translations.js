// All UI copy, keyed by language. English is the default (brief §3 / §11.3).
// Chinese strings use full-width punctuation where appropriate.
export const translations = {
  en: {
    // Header / nav
    'nav.services': 'Our Services',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',

    // Stepper (label = desktop, short = mobile)
    'steps.party.label': 'Party',
    'steps.party.short': 'Party',
    'steps.services.label': 'Services',
    'steps.services.short': 'Services',
    'steps.therapist.label': 'Therapist',
    'steps.therapist.short': 'Therapist',
    'steps.dateTime.label': 'Date & time',
    'steps.dateTime.short': 'Date',
    'steps.details.label': 'Details',
    'steps.details.short': 'Details',

    // Party step
    'party.title': "Who's coming in?",
    'party.titleAlt': '预约人数',
    'party.lead':
      'Book just for yourself or add guests - each person picks their own service and therapist.',
    'guest.primaryName': 'You - Guest 1',
    'guest.label': 'Guest',
    'guest.primarySub': 'Primary guest',
    'guest.sub': "We'll set their service next",
    'guest.youPill': 'You',
    'guest.add': 'Add a guest',
    'guest.remove': 'Remove',
    'info.guests':
      'You can add or remove guests anytime before checkout. Each guest gets their own service and therapist.',

    // Services step
    'services.title': 'Choose your service',
    'services.titleAlt': '选择项目',
    'services.lead': 'For {guest}. Start with a single session or build a combo.',
    'services.single': 'Single session',
    'services.combo': 'Combo package',
    'services.category': 'Category',
    'services.duration': 'Duration',
    'services.technique': 'Technique',
    'services.service': 'Service',
    'services.comboSize': 'Combo size',
    'services.slot': 'Service {n}',
    'services.slotPlaceholder': 'Choose a technique…',
    'services.addons': 'Add-ons',
    'services.addonsHint': 'optional extras, tap to include',
    'services.addonsFor': 'Optional extras for {guest}. Tap to include.',
    'services.confirmGuest': 'Confirm {guest} selection',
    'services.chooseService': 'Choose a service',
    'services.inProgress': 'In progress',
    'services.done': 'Done',
    'services.edit': 'Edit',
    'services.notStarted': 'Not started',
    'services.waiting': 'Waiting - confirm {guest} first',
    'services.tapToChoose': 'Tap to choose a service',
    'services.addGuest': 'Add another guest',
    'services.free': 'Free',
    'services.promo':
      'Enjoy a one-hour massage ($80) with a complimentary fire cupping treatment during your session - upon request.',
    'services.pickEach': 'Pick a service for each guest to continue.',
    'common.back': 'Back',

    // Therapist step
    'therapist.title': 'Choose a therapist',
    'therapist.titleAlt': '选择理疗师',
    'therapist.lead':
      "For {guest}. Prefer to leave it to us? We'll match the best available practitioner.",
    'therapist.noPref': 'No preference',
    'therapist.noPrefHint': "We'll match you with one of our practitioners:",
    'therapist.female': 'Female',
    'therapist.male': 'Male',
    'therapist.pickByName': 'Pick by name',
    'therapist.info':
      'Your preference is saved either way - it helps us assign the right practitioner.',
    'therapist.availability': 'Availability is confirmed at the next step.',
    'summary.therapist': 'Therapist',

    // Date & time step
    'datetime.title': 'Choose date & time',
    'datetime.titleAlt': '选择时间',
    'datetime.leadSingle': 'Only time slots that fit your service are shown.',
    'datetime.leadMulti':
      'Your whole party will be seen together - only slots that work for everyone are shown.',
    'datetime.selectDate': 'Select date',
    'datetime.availableTimes': 'Available times',
    'datetime.info':
      'Times reflect therapist availability plus a short prep buffer between sessions.',
    'datetime.pickTime': 'Pick a time to continue.',
    'summary.servicesAddons': 'Services + add-ons',
    'summary.date': 'Date',
    'summary.time': 'Time',
    'summary.dateTimeRow': 'Date & time',
    'summary.holdNote': 'Your slot is held for 10 minutes while you finish.',

    // Details & payment step
    'details.title': 'Details & payment',
    'details.titleAlt': '结账',
    'details.lead': "We'll use this to confirm your booking and send reminders.",
    'details.fullName': 'Full name',
    'details.fullNamePh': 'e.g. Wei Zhang',
    'details.phone': 'Phone',
    'details.phonePh': '(215) 555-0142',
    'details.email': 'Email',
    'details.emailPh': 'you@email.com',
    'details.note': 'Add a note, or disclose any health concerns.',
    'details.optional': 'Optional',
    'details.notePh': 'Note',
    'details.tipLabel': 'Add a tip - goes 100% to your therapist',
    'details.tipCustom': 'Custom $',
    'details.tipLater': 'Later',
    'details.tipCustomPh': 'Tip amount',
    'details.tip': 'Tip',
    'details.payment': 'Payment',
    'details.prepayTitle': 'Prepay now to hold your spot',
    'details.prepayDesc': 'Secure your appointment with full payment via Square.',
    'details.prepayInfo':
      'Your time is locked in and guaranteed. Need to change plans? Reschedule 24 hours prior. Recommended for weekends and peak times, which fill quickly.',
    'details.cardNumber': 'Card number',
    'details.expiry': 'Expiry',
    'details.cvc': 'CVC',
    'details.securedBy': 'Secured by Square',
    'details.payVisitTitle': 'Pay at your visit',
    'details.payVisitDesc': 'Reserve now, pay after your treatments.',
    'details.waiver':
      "I've read and agree to the liability waiver. Free cancellation up to 24 hours before - within 24 hours, please call the studio to confirm.",
    'details.terms': 'Terms & Conditions',
    'details.finalReview': 'Final review before any charge.',
    'details.submitTitle': 'Booking request received!',
    'details.submitDesc':
      "Thanks, {name}. We'll confirm your appointment shortly and send reminders. Payment is finalized by our team.",
    'details.waiverCta': 'I understand',

    // Confirmation page
    'confirm.title': "You're all set!",
    'confirm.subtitle': 'Your appointment has been confirmed. See you soon.',
    'confirm.details': 'Appointment details',
    'confirm.address': '936 Arch St, 2nd Floor, Philadelphia',
    'confirm.arrive': 'Please arrive 10 minutes early.',
    'confirm.you': 'You',
    'confirm.free': '(free)',
    'confirm.services': 'Services',
    'confirm.addons': 'Add-ons',
    'confirm.totalCharged': 'Total charged',
    'gift.eyebrow': 'Give the gift of relief',
    'gift.title': 'Share Pain Away with someone you love',
    'gift.desc':
      'Gift cards are redeemable for any service or add-on. Perfect for a friend who deserves a break.',
    'gift.cta': 'Buy a gift card',

    // Booking summary
    'summary.title': 'Booking Summary',
    'summary.guests': 'Guests',
    'summary.services': 'Services',
    'summary.dateTime': 'Date & time',
    'summary.subtotal': 'Subtotal',
    'summary.total': 'Total',
    'summary.continue': 'Continue',
    'summary.disclaimer': "You won't be charged until you confirm.",

    // Footer
    'footer.address': '936 Arch St, 2nd Floor, Philadelphia · © 2026',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.faq': 'FAQ',

    // Placeholder steps
    'placeholder.body':
      "This step isn't built yet - Party (step 1) is the reference screen.",
    'placeholder.back': '← Back to Party',

    // Not found
    'notfound.title': 'Page not found',
    'notfound.back': 'Back to booking',
  },

  zh: {
    // Header / nav
    'nav.services': '服务项目',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',

    // Stepper
    'steps.party.label': '人数',
    'steps.party.short': '人数',
    'steps.services.label': '服务',
    'steps.services.short': '服务',
    'steps.therapist.label': '理疗师',
    'steps.therapist.short': '理疗师',
    'steps.dateTime.label': '日期与时间',
    'steps.dateTime.short': '日期',
    'steps.details.label': '详细信息',
    'steps.details.short': '详情',

    // Party step
    'party.title': '预约人数',
    'party.titleAlt': "Who's coming in?",
    'party.lead':
      '仅为自己预约，或添加同行人-每位客人可分别选择各自的服务与理疗师。',
    'guest.primaryName': '您 - 客人 1',
    'guest.label': '客人',
    'guest.primarySub': '主要客人',
    'guest.sub': '下一步设置其服务',
    'guest.youPill': '您',
    'guest.add': '添加同行人',
    'guest.remove': '移除',
    'info.guests':
      '结账前可随时添加或移除同行人。每位客人均可选择各自的服务与理疗师。',

    // Services step
    'services.title': '选择您的服务',
    'services.titleAlt': "Choose your service",
    'services.lead': '为{guest}预约。可选择单项服务或组合套餐。',
    'services.single': '单项服务',
    'services.combo': '组合套餐',
    'services.category': '类别',
    'services.duration': '时长',
    'services.technique': '手法',
    'services.service': '服务',
    'services.comboSize': '套餐数量',
    'services.slot': '服务 {n}',
    'services.slotPlaceholder': '选择手法……',
    'services.addons': '附加项目',
    'services.addonsHint': '可选附加，点击添加',
    'services.addonsFor': '为{guest}选择可选附加项目，点击添加。',
    'services.confirmGuest': '确认{guest}的选择',
    'services.chooseService': '选择服务',
    'services.inProgress': '进行中',
    'services.done': '已完成',
    'services.edit': '修改',
    'services.notStarted': '未开始',
    'services.waiting': '等待中-请先确认{guest}',
    'services.tapToChoose': '点击选择服务',
    'services.addGuest': '添加其他客人',
    'services.free': '免费',
    'services.promo':
      '在理疗过程中享受一小时按摩（$80），并应要求免费赠送火罐疗程。',
    'services.pickEach': '请为每位客人选择服务后继续。',
    'common.back': '返回',

    // Therapist step
    'therapist.title': '选择理疗师',
    'therapist.titleAlt': 'Choose a therapist',
    'therapist.lead': '为{guest}预约。想交给我们？我们会为您匹配最合适的理疗师。',
    'therapist.noPref': '无偏好',
    'therapist.noPrefHint': '我们将为您安排以下其中一位理疗师：',
    'therapist.female': '女性',
    'therapist.male': '男性',
    'therapist.pickByName': '按姓名选择',
    'therapist.info':
      '无论如何您的偏好都会被保存-这有助于我们安排合适的理疗师。',
    'therapist.availability': '可预约时间将在下一步确认。',
    'summary.therapist': '理疗师',

    // Date & time step
    'datetime.title': '选择日期与时间',
    'datetime.titleAlt': 'Choose date & time',
    'datetime.leadSingle': '仅显示适合您所选服务的时段。',
    'datetime.leadMulti': '您的同行人将一同接受理疗-仅显示适合所有人的时段。',
    'datetime.selectDate': '选择日期',
    'datetime.availableTimes': '可预约时段',
    'datetime.info': '时段已考虑理疗师的空档以及理疗之间的准备时间。',
    'datetime.pickTime': '请选择一个时段后继续。',
    'summary.servicesAddons': '服务 + 附加',
    'summary.date': '日期',
    'summary.time': '时间',
    'summary.dateTimeRow': '日期与时间',
    'summary.holdNote': '您的时段将为您保留 10 分钟以完成预约。',

    // Details & payment step
    'details.title': '结账',
    'details.titleAlt': 'Details & payment',
    'details.lead': '我们将用这些信息确认您的预约并发送提醒。',
    'details.fullName': '姓名',
    'details.fullNamePh': '例如：张伟',
    'details.phone': '电话',
    'details.phonePh': '(215) 555-0142',
    'details.email': '电子邮箱',
    'details.emailPh': 'you@email.com',
    'details.note': '添加备注，或告知任何健康状况。',
    'details.optional': '可选',
    'details.notePh': '备注',
    'details.tipLabel': '添加小费-100% 归您的理疗师所有',
    'details.tipCustom': '自定义 $',
    'details.tipLater': '稍后',
    'details.tipCustomPh': '小费金额',
    'details.tip': '小费',
    'details.payment': '支付',
    'details.prepayTitle': '立即预付以锁定您的时段',
    'details.prepayDesc': '通过 Square 全额支付以确认您的预约。',
    'details.prepayInfo':
      '您的时段已锁定并得到保证。需要更改？请提前 24 小时改期。建议在周末及高峰时段预付，名额很快约满。',
    'details.cardNumber': '卡号',
    'details.expiry': '有效期',
    'details.cvc': '安全码',
    'details.securedBy': '由 Square 保护',
    'details.payVisitTitle': '到店支付',
    'details.payVisitDesc': '现在预约，理疗后支付。',
    'details.waiver':
      '我已阅读并同意免责声明。提前 24 小时可免费取消-24 小时内请致电门店确认。',
    'details.terms': '条款与条件',
    'details.finalReview': '收费前的最后确认。',
    'details.submitTitle': '预约请求已收到！',
    'details.submitDesc':
      '谢谢您，{name}。我们会尽快确认您的预约并发送提醒。付款将由我们的团队完成。',
    'details.waiverCta': '我明白了',

    // Confirmation page
    'confirm.title': '一切就绪！',
    'confirm.subtitle': '您的预约已确认。我们很快见！',
    'confirm.details': '预约详情',
    'confirm.address': '费城阿奇街 936 号 2 楼',
    'confirm.arrive': '请提前 10 分钟到达。',
    'confirm.you': '您',
    'confirm.free': '（免费）',
    'confirm.services': '服务',
    'confirm.addons': '附加项目',
    'confirm.totalCharged': '已收取总额',
    'gift.eyebrow': '赠予放松好礼',
    'gift.title': '把 Pain Away 分享给您所爱的人',
    'gift.desc':
      '礼品卡可用于任何服务或附加项目，送给值得放松的朋友再合适不过。',
    'gift.cta': '购买礼品卡',

    // Booking summary
    'summary.title': '预约摘要',
    'summary.guests': '客人',
    'summary.services': '服务',
    'summary.dateTime': '日期与时间',
    'summary.subtotal': '小计',
    'summary.total': '合计',
    'summary.continue': '继续',
    'summary.disclaimer': '确认前不会扣款。',

    // Footer
    'footer.address': '费城阿奇街 936 号 2 楼 · © 2026',
    'footer.privacy': '隐私政策',
    'footer.terms': '条款',
    'footer.faq': '常见问题',

    // Placeholder steps
    'placeholder.body': '此步骤尚未构建-人数（第 1 步）为参考界面。',
    'placeholder.back': '← 返回人数',

    // Not found
    'notfound.title': '页面未找到',
    'notfound.back': '返回预约',
  },
}

/* ---------------------------------------------------------------------------
 * Inline SVG icon set for tool cards.
 *
 * All icons are drawn on a 24x24 grid as strokes in currentColor, so they
 * inherit the theme and cost a few hundred bytes each with no extra request.
 * ------------------------------------------------------------------------- */

const P = {
  // --- money ---------------------------------------------------------------
  banknote:   '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  coins:      '<ellipse cx="12" cy="7" rx="7.5" ry="3.2"/><path d="M4.5 7v4.5c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2V7"/><path d="M4.5 11.5V16c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2v-4.5"/>',
  wallet:     '<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z"/><circle cx="17" cy="14" r="1"/>',
  piggy:      '<path d="M7 8.5h10l1.2 10.2a2 2 0 0 1-2 2.3H7.8a2 2 0 0 1-2-2.3Z"/><path d="M8.5 8.5V5.5h7v3"/><path d="M12 12.5v4M10 14.5h4"/>',
  percent:    '<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  tag:        '<path d="M11.5 3H20a1 1 0 0 1 1 1v8.5a2 2 0 0 1-.6 1.4l-7 7a2 2 0 0 1-2.8 0l-6.5-6.5a2 2 0 0 1 0-2.8l7-7A2 2 0 0 1 11.5 3Z"/><circle cx="16.5" cy="7.5" r="1.3"/>',
  receipt:    '<path d="M5 3v18l2.5-1.5L10 21l2-1.5L14 21l2.5-1.5L19 21V3z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  chartUp:    '<path d="M3 20h18"/><path d="M4 16l5-5 4 3 6-7"/><path d="M15 7h4v4"/>',
  scaleBal:   '<path d="M4 20.5h16"/><path d="M6.8 20.5 8.2 10h7.6l1.4 10.5"/><path d="M9.5 10V7.8a2.5 2.5 0 0 1 5 0V10"/>',

  // --- time & dates --------------------------------------------------------
  calendar:   '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  calRange:   '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7 14h4M13 14h4"/>',
  calHeart:   '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 18c-2-1.4-3-2.4-3-3.6a1.5 1.5 0 0 1 3-.5 1.5 1.5 0 0 1 3 .5c0 1.2-1 2.2-3 3.6Z"/>',
  clock:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  hourglass:  '<path d="M7 3h10M7 21h10"/><path d="M17 3v3.5c0 2-3 3.5-3 5.5s3 3.5 3 5.5V21M7 3v3.5c0 2 3 3.5 3 5.5s-3 3.5-3 5.5V21"/>',
  cake:       '<path d="M3.5 20.5h17"/><path d="M5.2 20.5v-7a2 2 0 0 1 2-2h9.6a2 2 0 0 1 2 2v7"/><path d="M5.2 15.6c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.6 0"/><path d="M12 11.5V8"/><circle cx="12" cy="6" r="1.4"/>',
  globeClock: '<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3a12 12 0 0 1 0 14 12 12 0 0 1 0-14"/><circle cx="17.5" cy="17.5" r="4.5"/><path d="M17.5 15.5V18l1.5 1"/>',

  // --- health --------------------------------------------------------------
  heartPulse: '<path d="M20.4 6.6a5 5 0 0 0-7.1 0L12 7.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 22l8.4-8.3a5 5 0 0 0 0-7.1Z"/><path d="M3.5 13h4l1.5-2.5 2 4 1.5-2.5h4"/>',
  heart:      '<path d="M20.4 6.6a5 5 0 0 0-7.1 0L12 7.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 22l8.4-8.3a5 5 0 0 0 0-7.1Z"/>',
  bodyScale:  '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7.5 14.5a4.5 4.5 0 0 1 9 0"/><path d="m12 14.5 3-3"/>',
  tapeMeasure:'<path d="M3 16a9 9 0 1 1 18 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M7 21v-3M12 21v-4M17 21v-3"/><circle cx="12" cy="14" r="2.5"/>',
  flame:      '<path d="M12 2.5c3.2 4 5.5 6.1 5.5 9.6a5.5 5.5 0 0 1-11 0c0-1.7.8-3.1 1.9-4.4.4 1 1 1.7 1.7 2 .3-2.7 1-5.1 1.9-7.2Z"/><path d="M12 19.5a2.8 2.8 0 0 0 2.8-2.8c0-1.6-1.3-2.3-1.3-3.7-.9.8-1.6 1.3-1.6 2.5 0-.8-.9-1.5-.9-1.5-.6.8-1.2 1.6-1.2 2.7A2.8 2.8 0 0 0 12 19.5Z"/>',
  moon:       '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  droplet:    '<path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3Z"/>',
  glass:      '<path d="M5.5 3.5h13l-1.3 15.6a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9Z"/><path d="M6.3 11.5h11.4"/>',
  pill:       '<rect x="2.6" y="8.6" width="18.8" height="6.8" rx="3.4" transform="rotate(-45 12 12)"/><path d="M9 9l6 6"/>',
  walking:    '<circle cx="13.6" cy="4.4" r="2.2"/><path d="m10.2 21.2 2.2-6.2-2.3-2.6.6-3.9 3.3 1.9 2.4 2.2"/><path d="m10.1 12.4-3.2 1.7-1.4 6"/><path d="m12.4 15 3.4 6.2"/>',
  eye:        '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  baby:       '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01"/><path d="M9.5 15a4 4 0 0 0 5 0"/>',

  // --- files & images ------------------------------------------------------
  image:      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
  compress:   '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9 6 6M9 9V6.5M9 9H6.5"/><path d="m15 15 3 3M15 15v2.5M15 15h2.5"/>',
  resize:     '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h4v4"/><path d="m8 8 4.5 4.5"/><path d="M16 16h-4v-4"/><path d="M16 16l-4.5-4.5"/>',
  crop:       '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
  doc:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  docMerge:   '<path d="M9 2H5a2 2 0 0 0-2 2v9"/><path d="M15 2h-2"/><path d="M8 22h10a2 2 0 0 0 2-2V9l-5-5h-5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"/><path d="M15 4v5h5"/>',
  docSplit:   '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M4 13h16" stroke-dasharray="2.5 2.5"/>',
  docImage:   '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="9.5" cy="13" r="1.2"/><path d="m7 18 3-3 2.5 2.5L15 15l2 3"/>',
  docScan:    '<path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 9h8M8 12.5h8M8 16h5"/>',
  idCard:     '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17a3.8 3.8 0 0 1 7 0"/><path d="M15 10h4M15 13.5h4"/>',
  layers:     '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  stamp:      '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.4a3.6 3.6 0 1 0 0 5.2"/>',

  // --- text & documents ----------------------------------------------------
  textLines:  '<path d="M4 6h16M4 11h16M4 16h10"/>',
  textCase:   '<path d="M3 18 7.5 7l4.5 11M4.6 14.5h5.8"/><path d="M20 18v-5.2a2.8 2.8 0 0 0-5.5-.8"/><path d="M20 15.5c-3.5 0-5 .6-5 1.6s1 1.4 2.2 1.4c1.7 0 2.8-1 2.8-2.4"/>',
  pen:        '<path d="M17 3.5a2.1 2.1 0 0 1 3 3L8 18.5 3.5 20 5 15.5Z"/><path d="M15 5.5 18.5 9"/>',
  quote:      '<path d="M9 7c-2.8 0-4.5 2-4.5 4.6C4.5 14 6 15.5 8 15.5c.5 0 1-.1 1.3-.3-.4 1.6-1.6 2.7-3.3 3.3M20 7c-2.8 0-4.5 2-4.5 4.6 0 2.4 1.5 3.9 3.5 3.9.5 0 1-.1 1.3-.3-.4 1.6-1.6 2.7-3.3 3.3"/>',
  card:       '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 10h5M6 14h3"/><circle cx="17" cy="12" r="2.5"/>',
  cardFold:   '<path d="M4 4h8v17H4z"/><path d="M12 4h8v17h-8z"/><path d="M12 3v19"/><path d="M15 10h2"/>',
  envelope:   '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 6.5 8.6 6a1.6 1.6 0 0 0 1.8 0l8.6-6"/>',
  docPerson:  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="12" cy="13" r="2"/><path d="M8.8 18.5a3.6 3.6 0 0 1 6.4 0"/>',
  keyboard:   '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9.5 14h5"/>',

  // --- generators ----------------------------------------------------------
  qr:         '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M18 18h3v3h-3z"/>',
  barcode:    '<path d="M3 5v14M6.5 5v14M9.5 5v10M13 5v14M16.5 5v10M20 5v14"/>',
  wifi:       '<path d="M2.5 9a15 15 0 0 1 19 0"/><path d="M5.5 12.5a10.5 10.5 0 0 1 13 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.2"/>',
  key:        '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.8 12.2 8-8"/><path d="m16.5 6.5 2.5 2.5M14 9l2.5 2.5"/>',
  shield:     '<path d="M12 22s8-3.5 8-10V5.5l-8-3-8 3V12c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  palette:    '<path d="M12 21a9 9 0 1 1 9-9c0 1.9-1.6 2.5-3 2.5h-1.5a2 2 0 0 0-1.4 3.4c.4.5.4 1.4-.6 2a4 4 0 0 1-2.5 1.1Z"/><circle cx="7.5" cy="12" r="1.1"/><circle cx="9.5" cy="8" r="1.1"/><circle cx="14.5" cy="7.5" r="1.1"/>',

  // --- random & fun --------------------------------------------------------
  shuffle:    '<path d="M16 3.5h4.5V8"/><path d="M20.5 3.5 13 11"/><path d="M16 20.5h4.5V16"/><path d="M20.5 20.5 14.5 14.5"/><path d="M3.5 3.5 9.5 9.5"/><path d="M3.5 20.5 11 13"/>',
  dice:       '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/><circle cx="8.5" cy="15.5" r="1.2"/>',
  coin:       '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M14.5 9.8c-.5-.9-1.5-1.3-2.5-1.3-1.4 0-2.5.7-2.5 1.9 0 2.6 5 1.4 5 4 0 1.2-1.1 1.9-2.5 1.9-1 0-2-.4-2.5-1.3"/>',
  wheel:      '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/><circle cx="12" cy="12" r="2"/>',
  users:      '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0"/><path d="M16 5.3a3.2 3.2 0 0 1 0 5.4M17.5 13.4a6.5 6.5 0 0 1 4 5.6"/>',
  gift:       '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/><path d="M12 8v13"/><path d="M12 8S10.5 4 8.5 4a2 2 0 0 0 0 4M12 8s1.5-4 3.5-4a2 2 0 0 1 0 4"/>',
  ticket:     '<path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2.5 2.5 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2.5 2.5 0 0 0 0-6Z"/><path d="M14 5v3M14 11v2M14 16v3"/>',
  hat:        '<path d="M4 18h16"/><path d="M6.5 18c-.8-3.4-.4-6.3.8-8.6C8.5 7 10.1 6 12 6s3.5 1 4.7 3.4c1.2 2.3 1.6 5.2.8 8.6"/><path d="M9 6.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5"/>',
  forkKnife:  '<path d="M7 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3"/><path d="M9 12v9M7 3v4M11 3v4"/><path d="M17 3c-1.4 1.4-2 3-2 5s.6 2.5 2 2.5V21"/>',
  checkX:     '<path d="m3.5 8.5 2.5 2.5 4.5-5"/><path d="m3.5 18 2.5 2.5L10.5 15"/><path d="M14 8h7M14 18h7"/>',
  bulb:       '<path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.6V18h6v-2.1c0-.6.3-1.2.8-1.6A6.5 6.5 0 0 0 12 2.5Z"/>',
  stars:      '<path d="m12 3 1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4Z"/><path d="m18 15.5.8 2 2.2.6-2.2.6-.8 2-.8-2-2.2-.6 2.2-.6Z"/><path d="m6 16.5.6 1.5 1.6.5-1.6.5L6 20.5l-.6-1.5L3.8 18.5l1.6-.5Z"/>',
  brain:      '<circle cx="11" cy="8" r="4"/><path d="M4 20.5a7 7 0 0 1 14 0"/><path d="m19 3 .8 2.2 2.2.8-2.2.8L19 9l-.8-2.2-2.2-.8 2.2-.8Z"/>',
  sparkle:    '<path d="m12 2.5 2.2 5.8 5.8 2.2-5.8 2.2L12 18.5l-2.2-5.8L4 10.5l5.8-2.2Z"/><path d="M19 17.5v3M17.5 19h3"/>',

  // --- home & everyday -----------------------------------------------------
  house:      '<path d="m3 10.5 9-7 9 7"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>',
  houseSwap:  '<path d="m2 9 6-5 6 5"/><path d="M4 8v10a1 1 0 0 0 1 1h6"/><path d="M15 13h6M18 10l3 3-3 3"/><path d="M21 19h-6"/>',
  cart:       '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.5l2.4 12.2a1.5 1.5 0 0 0 1.5 1.3h9.3a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>',
  checklist:  '<path d="m3 6.5 1.8 1.8L8 5"/><path d="m3 13.5 1.8 1.8L8 12"/><path d="m3 20.5 1.8 1.8L8 19"/><path d="M11 7h10M11 14h10M11 21h7"/>',
  checkGrid:  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="m5 6.5 1.2 1.2L8 6M16 17.5l1.2 1.2L19 17"/>',
  suitcase:   '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2"/><path d="M2.5 12.5h19"/>',
  paintRoll:  '<rect x="3" y="3" width="12" height="6" rx="1.5"/><path d="M15 6h3a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 18 11h-6v2"/><rect x="10" y="13" width="4" height="8" rx="1.5"/>',
  bolt:       '<path d="M13.5 2 4 13.5h6.5L10 22l9.5-11.5H13Z"/>',
  chef:       '<path d="M3.5 9.5h17"/><path d="M5 9.5v6.5a4.5 4.5 0 0 0 4.5 4.5h5a4.5 4.5 0 0 0 4.5-4.5V9.5"/><path d="M9 6.5V4M12 6.5V3M15 6.5V4"/>',
  cup:        '<path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M4 12h12"/>',
  thermometer:'<path d="M13.5 14.2V5a2.5 2.5 0 0 0-5 0v9.2a4.5 4.5 0 1 0 5 0Z"/><path d="M11 8v7"/>',
  oven:       '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M6.5 6h.01M10 6h.01"/><rect x="6.5" y="12" width="11" height="6" rx="1"/>',

  // --- converters & measurement -------------------------------------------
  ruler:      '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v3M10 7v5M14 7v3M18 7v5"/>',
  swap:       '<path d="M7 4 3.5 7.5 7 11"/><path d="M3.5 7.5H16a4.5 4.5 0 0 1 0 9h-1"/><path d="m17 20 3.5-3.5L17 13"/>',
  gauge:      '<path d="M3.5 17a9 9 0 1 1 17 0"/><path d="m12 13 4-4"/><circle cx="12" cy="13" r="1.5"/><path d="M4 20h16"/>',
  shirt:      '<path d="M8 3 4 5.5l1.5 4L8 8.5V21h8V8.5l2.5 1L20 5.5 16 3a4 4 0 0 1-8 0Z"/>',
  shoe:       '<path d="M2.5 17.5V11h3.8l2.2 2 3-1.5 2.5 2.2 5.5 1.4a2 2 0 0 1 1.5 2v.4a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1Z"/><path d="M6.3 11 5 8"/>',
  fuel:       '<path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16"/><path d="M3 21h11"/><path d="M6.5 8.5h4"/><path d="M13 9h2.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 0 3 0V9l-2-2.5"/>',
  car:        '<path d="M4 16.5v-3.8l2.2-5.2A2 2 0 0 1 8 6.2h8a2 2 0 0 1 1.8 1.3l2.2 5.2v3.8"/><path d="M4 13h16"/><path d="M4 16.5h16"/><circle cx="7.8" cy="18" r="1.7"/><circle cx="16.2" cy="18" r="1.7"/>',
  column:     '<path d="M4 21h16"/><path d="M5 21V8h14v13"/><path d="M3.5 8h17l-2-4h-13Z"/><path d="M9 8v13M15 8v13"/>',
  mic:        '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21M9 21h6"/>',
  speaker:    '<path d="M11 4.5 6.5 8.5H3v7h3.5L11 19.5Z"/><path d="M15 9a4 4 0 0 1 0 6M17.8 6.5a8 8 0 0 1 0 11"/>',
  graduation: '<path d="m2.5 8.5 9.5-4.5 9.5 4.5-9.5 4.5Z"/><path d="M6.5 10.7V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-5.3"/><path d="M21.5 8.5V14"/>',
};

/* Which icon each tool uses. Closely related tools deliberately share one. */
const MAP = {
  // calculators
  'age-calculator': 'cake', 'birthday-countdown': 'cake',
  'bmi-calculator': 'bodyScale', 'ideal-weight-calculator': 'scaleBal',
  'car-loan-calculator': 'car', 'fuel-cost-calculator': 'fuel',
  'compound-interest-calculator': 'chartUp', 'retirement-calculator': 'piggy',
  'date-difference-calculator': 'calRange', 'discount-calculator': 'tag',
  'gpa-calculator': 'graduation', 'income-tax-calculator': 'receipt',
  'loan-calculator': 'banknote', 'mortgage-calculator': 'house',
  'overtime-pay-calculator': 'clock', 'percentage-calculator': 'percent',
  'pregnancy-due-date-calculator': 'baby', 'salary-calculator': 'wallet',
  'sales-tax-calculator': 'receipt', 'tip-calculator': 'coins',
  // converters
  'clothing-size-converter': 'shirt', 'cooking-converter': 'cup',
  'currency-converter': 'swap', 'heic-to-jpg': 'image',
  'oven-temperature-converter': 'oven', 'roman-numeral-converter': 'column',
  'shoe-size-converter': 'shoe', 'speed-converter': 'gauge',
  'temperature-converter': 'thermometer', 'text-to-speech': 'speaker',
  'time-zone-converter': 'globeClock', 'unit-converter': 'ruler',
  'voice-to-text': 'mic',
  // file & image
  'background-remover': 'layers', 'image-compressor': 'compress',
  'image-resizer': 'resize', 'image-to-pdf': 'docImage',
  'passport-photo-maker': 'idCard', 'pdf-compressor': 'compress',
  'pdf-merger': 'docMerge', 'pdf-splitter': 'docSplit',
  'pdf-to-image': 'docImage', 'photo-cropper': 'crop',
  'watermark-photo': 'stamp',
  // random
  'baby-name-generator': 'baby', 'coin-flip': 'coin', 'dice-roller': 'dice',
  'gift-idea-generator': 'gift', 'lottery-number-picker': 'ticket',
  'random-name-picker': 'shuffle', 'random-number-generator': 'dice',
  'random-team-generator': 'users', 'what-to-eat-picker': 'forkKnife',
  'wheel-of-names': 'wheel', 'yes-no-decision-maker': 'checkX',
  // health
  'blood-type-calculator': 'droplet', 'body-fat-calculator': 'tapeMeasure',
  'calorie-calculator': 'flame', 'color-blindness-test': 'eye',
  'heart-rate-calculator': 'heartPulse', 'period-tracker': 'calHeart',
  'sleep-calculator': 'moon', 'step-counter': 'walking',
  'water-intake-calculator': 'glass', 'medicine-reminder': 'pill',
  // home
  'bill-split-calculator': 'receipt', 'budget-tracker': 'wallet',
  'electricity-bill-estimator': 'bolt', 'grocery-list-maker': 'cart',
  'habit-tracker': 'checkGrid', 'packing-list-generator': 'suitcase',
  'paint-calculator': 'paintRoll', 'recipe-scaler': 'chef',
  'rent-vs-buy-calculator': 'houseSwap', 'todo-list': 'checklist',
  'unit-price-comparator': 'tag',
  // fun
  'anniversary-calculator': 'heart', 'countdown-timer': 'hourglass',
  'love-calculator': 'heart', 'meme-generator': 'image',
  'nickname-generator': 'sparkle', 'personality-test': 'brain',
  'quote-generator': 'quote', 'random-fact-generator': 'bulb',
  'typing-speed-test': 'keyboard', 'zodiac-sign-finder': 'stars',
  // text
  'business-card-maker': 'card', 'greeting-card-maker': 'cardFold',
  'image-to-text': 'docScan', 'invitation-card-maker': 'envelope',
  'resume-builder': 'docPerson', 'signature-maker': 'pen',
  'text-case-converter': 'textCase', 'word-counter': 'textLines',
  // generators
  'barcode-generator': 'barcode', 'color-picker': 'palette',
  'password-generator': 'key', 'password-strength-checker': 'shield',
  'qr-code-generator': 'qr', 'wifi-qr-code-generator': 'wifi',
};

/** Fallback per category, so a new tool always renders something sensible. */
const CATEGORY_FALLBACK = {
  calculators: 'percent', converters: 'swap', 'file-tools': 'doc',
  random: 'dice', health: 'heartPulse', home: 'house',
  fun: 'sparkle', text: 'textLines', generators: 'qr',
};

/** Inline SVG for a tool, sized by CSS. */
export function toolIcon(tool) {
  const name = tool.icon || MAP[tool.slug] || CATEGORY_FALLBACK[tool.category] || 'doc';
  const body = P[name] || P.doc;
  return `<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export const iconNames = Object.keys(P);
export const iconMap = MAP;

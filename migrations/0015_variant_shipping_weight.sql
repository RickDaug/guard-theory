-- 0015_variant_shipping_weight.sql
--
-- The weight a label declares, from what is in the box.
--
-- Every Shippo label used to declare one fixed 10 oz parcel whatever the order
-- held, so a three-shirt order would be re-weighed by USPS and billed the
-- difference afterwards. The label now sums each line's weight times its
-- quantity, plus the packaging weight below.
--
-- OUNCES, because that is the unit the label is already declared in
-- (SHIP_PARCEL_WEIGHT_OZ, Shippo's mass_unit "oz"). Per size rather than per
-- product: an XL weighs more than an S.
--
-- NULL until the owner weighs the garment and types it. Nothing here guesses a
-- garment's weight; while any line in an order has none, the label falls back
-- to the old fixed weight and the order page says so.
alter table variant add column shipping_weight_oz numeric(6, 2)
  constraint variant_shipping_weight_positive check (shipping_weight_oz is null or shipping_weight_oz > 0);

-- The mailer, tissue and anything else that goes in the box with the garments,
-- added once per parcel. 0 until the owner weighs the packaging and sets it:
--   update setting set value = '<ounces>', updated_at = now() where key = 'ship_packaging_tare_oz';
insert into setting (key, value) values ('ship_packaging_tare_oz', '0')
  on conflict (key) do nothing;

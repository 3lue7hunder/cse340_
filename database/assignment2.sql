-- 1. Insert
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Modify account type
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 3. Delete from DB
DELETE FROM public.account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 4. Modify GM Hummer record
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Inner Join
SELECT inv_make, inv_model, classification_name
FROM public.inventory
JOIN public.classification
	ON public.inventory.classification_id = public.classification.classification_id
WHERE classification_name = 'Sport';

-- 6. Update image file paths
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images', 'images/vehicles'),
	inv_thumbnail = REPLACE (inv_thumbnail, '/images', '/images/vehicles');
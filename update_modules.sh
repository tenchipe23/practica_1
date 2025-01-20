#!/bin/bash

# List of module files to update
modules=(
  "cart/cart.module.ts"
  "checkout/checkout.module.ts"
  "login/login.module.ts"
  "orders/orders.module.ts"
  "products/products.module.ts"
  "profile/profile.module.ts"
  "promotions/promotions.module.ts"
  "register/register.module.ts"
  "settings/settings.module.ts"
)

# Base directory
base_dir="/Users/josemanuel/Documents/Desarrollo de aplicaciones moviles multiplataforma /actividades /practica_1/src/app/pages"

# Function to update module file
update_module() {
  local module_file="$1"
  sed -i '' \
      -e 's/declarations: \[.*\]/imports: [\n    CommonModule,\n    FormsModule,\n    IonicModule,\n    '"$(basename "$module_file" .module.ts)"'PageRoutingModule,\n    '"$(basename "$module_file" .module.ts | sed 's/\b./\u&/g')"'Page\n  ],\n  exports: ['"$(basename "$module_file" .module.ts | sed 's/\b./\u&/g')"'Page]/' \
      -e 's/import { FormsModule, ReactiveFormsModule }/import { FormsModule }/' \
      "$module_file"
}

# Update each module file
for module in "${modules[@]}"; do
  full_path="$base_dir/$module"
  echo "Updating $full_path"
  update_module "$full_path"
done

echo "Module updates complete!"

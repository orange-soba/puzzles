class CreateDummyUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :dummy_users do |t|
      t.string :name
      t.string :email

      t.timestamps
    end
  end
end

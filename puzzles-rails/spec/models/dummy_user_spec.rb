require 'rails_helper'

RSpec.describe DummyUser, type: :model do
  it "dummy test" do
    expect(build(:dummy_user)).to be_valid
  end

  it "ダミーデータの削除のための出力(Pending)" do
    pending("ダミーデータは削除してください :dummy_user")
    raise "まだダミーデータが未削除"
  end
end

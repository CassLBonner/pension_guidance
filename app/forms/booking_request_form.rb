class BookingRequestForm
  include ActiveModel::Model

  attr_accessor :location_id, :primary_slot, :secondary_slot, :tertiary_slot,
                :first_name, :last_name, :email, :telephone_number,
                :memorable_word, :appointment_type, :accessibility_requirements,
                :date_of_birth, :opt_in, :dc_pot

  with_options if: :step_one? do |step_one|
    step_one.validates :primary_slot, presence: true
    step_one.validates :secondary_slot, presence: true
    step_one.validates :tertiary_slot, presence: true
  end

  with_options if: :step_two? do |step_two|
    step_two.validates :first_name, presence: true
    step_two.validates :last_name, presence: true
    step_two.validates :email, presence: true, format: { with: /.+@.+\..+/ }
    step_two.validates :telephone_number, presence: true
    step_two.validates :memorable_word, presence: true
    step_two.validates :appointment_type, inclusion: { in: %w(50-54 55-plus) }, if: :date_of_birth
    step_two.validates :accessibility_requirements, inclusion: { in: %w(0 1) }
    step_two.validates :opt_in, acceptance: { accept: '1' }
    step_two.validates :dc_pot, inclusion: { in: %w(yes not-sure) }
    step_two.validates :date_of_birth, presence: true
  end

  def initialize(location_id, opts)
    @location_id = location_id
    super(opts)
  end

  def date_of_birth
    return nil unless /\d{4}-\d{1,2}-\d{1,2}/ === @date_of_birth # rubocop:disable Style/CaseEquality

    Date.parse(@date_of_birth)
  end

  def appointment_type
    if age < 50
      'under-50'
    elsif (50..54).cover?(age)
      '50-54'
    else
      '55-plus'
    end
  end

  def slots_for_calendar
    @slots_for_calendar ||= booking_location.slots.map(&:to_calendar)
  end

  def booking_location
    @booking_location ||= BookingLocations.find(location_id)
  end

  delegate :id, to: :booking_location, prefix: :booking_location

  def location_name
    booking_location.name_for(location_id)
  end

  def step_one_valid?
    @step = 1
    valid?
  end

  def step_two_valid?
    @step = 2
    valid?
  end

  def eligible?
    return true if step_two_valid?

    (errors.keys & %i(appointment_type dc_pot)).empty?
  end

  def step_one?
    @step == 1
  end

  def step_two?
    @step == 2
  end

  private

  def age
    return 0 unless date_of_birth

    age = Time.zone.today.year - date_of_birth.year
    age -= 1 if Time.zone.today.to_date < date_of_birth + age.years
    age
  end
end

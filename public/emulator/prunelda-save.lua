local SAVE_PATH = "/emulator/prunelda-save.atr"
local SAVE_DRIVE = "flop2"

local function find_save_drive()
  for _, image in pairs(manager.machine.images) do
    if image.brief_instance_name == SAVE_DRIVE or image.instance_name == SAVE_DRIVE then
      return image
    end
  end
  return nil
end

local function file_exists(path)
  local handle = io.open(path, "rb")
  if handle then
    handle:close()
    return true
  end
  return false
end

local function ensure_save_disk()
  local image = find_save_drive()
  if not image then
    print("Prunelda save disk: could not find " .. SAVE_DRIVE)
    return
  end

  if image.exists then
    image:unload()
  end

  local error_message
  if file_exists(SAVE_PATH) then
    error_message = image:load(SAVE_PATH)
  else
    error_message = image:create(SAVE_PATH)
  end

  if error_message then
    print("Prunelda save disk error: " .. error_message)
  end
end

ensure_save_disk()
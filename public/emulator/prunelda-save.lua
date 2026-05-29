local SAVE_DRIVE = "flop2"
local SAVE_PATHS = {
  "prunelda-save.atr",
  "/prunelda-save.atr",
  "/emulator/prunelda-save.atr",
}

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

  local error_message = nil

  for _, path in ipairs(SAVE_PATHS) do
    if file_exists(path) then
      error_message = image:load(path)
      if not error_message then
        return
      end
    end
  end

  for _, path in ipairs(SAVE_PATHS) do
    error_message = image:create(path)
    if not error_message then
      return
    end
  end

  print("Prunelda save disk error: " .. error_message)
end

ensure_save_disk()
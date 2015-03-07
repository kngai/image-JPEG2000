function [] = img2raw(inname, outname)
  [pathstr,name,ext] = fileparts(inname);
  if (strcmp(ext, '.dcm'))
    I = dicomread(inname);
  else
    I = imread(inname);
  end

  multibandwrite(I, outname, 'bip');
end

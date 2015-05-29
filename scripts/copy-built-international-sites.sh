
area2=( fr de en-GB ) ;

for  x in ${area2[@]} ; do
  echo "copying site: en-US => $x";
  rm -rf deploy/${x}/*
  cp -rp deploy/en-US/* deploy/${x}
done

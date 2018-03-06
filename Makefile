all:
	zip -r -0 thunderbird-taiga-extension.xpi *.rdf *.manifest content locale modules defaults skin >/dev/null 2>/dev/null

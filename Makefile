all:
	zip -r -0 taiga.xpi *.rdf *.manifest content locale modules defaults skin >/dev/null 2>/dev/null

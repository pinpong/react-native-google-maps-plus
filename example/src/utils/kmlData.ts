export const kmlString = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Example KML Data</name>
    <description>Example with marker, polygon and circle near San Francisco center</description>
    <Placemark>
      <name>Center Point</name>
      <Point><coordinates>-122.4194,37.7749,0</coordinates></Point>
    </Placemark>
    <Placemark>
      <name>Example Polygon</name>
      <Style>
        <LineStyle><color>ff0000ff</color><width>2</width></LineStyle>
        <PolyStyle><color>7d00ff00</color></PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -122.4244,37.7784,0
              -122.4144,37.7784,0
              -122.4144,37.7714,0
              -122.4244,37.7714,0
              -122.4244,37.7784,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    <Placemark>
      <name>Approximate Circle</name>
      <Style>
        <LineStyle><color>ffff0000</color><width>2</width></LineStyle>
        <PolyStyle><color>3dff0000</color></PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -122.4194,37.7770,0
              -122.4174,37.7770,0
              -122.4174,37.7730,0
              -122.4194,37.7730,0
              -122.4214,37.7730,0
              -122.4214,37.7770,0
              -122.4194,37.7770,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>;`;

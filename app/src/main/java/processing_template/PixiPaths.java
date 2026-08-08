package processing_template;

import java.io.File;

class PixiPaths {
  private static final String BASE_DIR =
      System.getProperty("user.home") + File.separator + "Documents" + File.separator + "pixi";

  static final String TEMP_DIR = BASE_DIR + File.separator + "temp";
  static final String EXPORT_DIR = BASE_DIR + File.separator + "export";
  static final String RENDERS_DIR = BASE_DIR + File.separator + "renders";

  static {
    new File(TEMP_DIR).mkdirs();
    new File(EXPORT_DIR).mkdirs();
    new File(RENDERS_DIR).mkdirs();
  }

  private PixiPaths() {
  }
}

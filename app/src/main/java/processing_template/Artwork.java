package processing_template;

import java.io.File;
import java.util.ArrayList;
import processing.core.PVector;
import processing.opengl.PShader;

class Artwork {
  Pop p;
  Sketch sk;
  int id;

  float x;
  float y;
  float w;
  float h;

  float g_scale;
  PVector g_offset;

  PShader shader;
  String[] shaderCode;

  ArrayList<PVector> animatedArgs;

  boolean isSelected = false;

  DNA dna;

  Artwork(Pop p_) {
    p = p_;
    sk = p.sk;
    id = p.arts.size();

    x = 0;
    y = 0;
    w = 0;
    h = 0;

    shaderCode = sk.fragmentShader.clone();
    shader = sk.loadShader("data/fragment.glsl");
  }

  // GENERAL

  void randomDNA() {
    dna = new DNA(p.app, "RANDOM");
    compileShader();
  }

  void assignDNA(DNA d) {
    dna = d;
    compileShader();
  }

  // RENDERING

  void display(float x_, float y_, float w_, float h_) {
    update(x_, y_, w_, h_);
    setShader();
    sk.shader(shader);
    sk.rect(x_, y_, w, h);
    sk.resetShader();
  }

  void compileShader() {
    shaderCode[shaderCode.length - 14] = dna.code;
    String path = PixiPaths.TEMP_DIR + File.separator + "shader" + id;
    sk.saveStrings(path, shaderCode);
    shader = sk.loadShader(path);
  }

  void setShader() {
    shader.set("u_g_off", g_offset.x, g_offset.y);
    shader.set("u_g_scale", g_scale);
    shader.set("u_off", dna.offset.x, dna.offset.y);
    shader.set("u_scale", dna.scale);
    shader.set("u_hoff", dna.hueOffset);
    shader.set("u_args", argsToFloat(animateArgs()));

    shader.set("u_aa", p.app.aa);
  }

  void update(float x_, float y_, float w_, float h_) {
    update(x_, y_, w_, h_, sk.height);
  }

  void update(float x_, float y_, float w_, float h_, float dh_) {
    if (x_ != x || y_ != y || w_ != w || h_ != h || dh_ != sk.height) {
      w = w_;
      h = h_;
      x = x_;
      y = y_;

      g_scale = 1 / w * 4;
      g_offset = new PVector(-x / w - 0.5f, -(dh_ - y - h - (w - h) / 2) / w - 0.5f);
      g_offset.mult(4);
    }
  }

  ArrayList<PVector> animateArgs() {
    animatedArgs = new ArrayList<>();
    for (PVector a : dna.args) {
      float addTime = (float) Math.sin((p.app.appTime) * 2 * Math.PI);
      PVector addTimeV = new PVector(addTime, addTime, addTime);
      animatedArgs.add(PVector.add(a, addTimeV));
    }
    return animatedArgs;
  }

  // CONTROLS

  void addScale(float amount) {
    dna.scale *= amount;
    dna.offset.div(amount);
  }

  void addOffset(float x, float y) {
    dna.offset.add(x, y);
  }

  void mouseMove() {
    PVector relMouse = new PVector((sk.mouseX - x) * g_scale, 1 - (sk.mouseY - y) * g_scale);
    PVector relPMouse = new PVector((sk.pmouseX - x) * g_scale, 1 - (sk.pmouseY - y) * g_scale);
    dna.offset.add(PVector.sub(relPMouse, relMouse));
  }

  // SERVICE

  float[] argsToFloat(ArrayList<PVector> args) {
    float[] temp = new float[args.size() * 3];
    for (int i = 0; i < args.size(); i++) {
      temp[i * 3] = args.get(i).x;
      temp[i * 3 + 1] = args.get(i).y;
      temp[i * 3 + 2] = args.get(i).z;
    }
    return temp;
  }

  // EXPORTING

  void render(String path) {
    update(0, 0, p.app.expSize, p.app.expSize, p.app.expSize);

    setShader();

    sk.renderer.beginDraw();
    sk.renderer.shader(shader);
    sk.renderer.rect(0, 0, p.app.expSize, p.app.expSize);
    sk.renderer.endDraw();
    sk.renderer.save(path);
    sk.resetShader();
  }

  void export(String path) {
    processing.core.PGraphics export = sk.createGraphics(p.app.expSize, p.app.expSize, processing.core.PConstants.P2D);
    update(0, 0, p.app.expSize, p.app.expSize, p.app.expSize);

    setShader();

    export.beginDraw();
    export.shader(shader);
    export.rect(0, 0, p.app.expSize, p.app.expSize);
    export.endDraw();
    export.save(path);
    sk.resetShader();
  }

  void export() {
    export(PixiPaths.EXPORT_DIR + File.separator + "image_" + (int) Rnd.random(999999) + ".jpg");
  }
}

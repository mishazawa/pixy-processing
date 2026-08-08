package processing_template;

import java.util.ArrayList;
import processing.core.PConstants;
import processing.core.PGraphics;

class NodeDisplay {
  Sketch sk;
  Pixi app;

  PGraphics canvas;
  float xmar = 5;
  float ymar = 20;
  float nxsize = 35;
  float nysize = 25;

  NodeDisplay(Sketch sk, Pixi app) {
    this.sk = sk;
    this.app = app;
    canvas = sk.createGraphics(512, 512, PConstants.P2D);
  }

  void display(DNA dna, float x_, float y_, float w_, float h_) {
    process(dna);
    sk.image(canvas, x_, y_, w_, h_);
  }

  void process(DNA d) {
    canvas.beginDraw();
    canvas.textFont(app.font);
    canvas.textSize(14);
    canvas.clear();
    canvas.rectMode(PConstants.CENTER);
    canvas.textAlign(PConstants.CENTER, PConstants.CENTER);
    canvas.smooth(0);

    canvas.translate(nxsize / 2 + 1, 0);

    boolean ok = true;
    int iter = 1;
    ArrayList<Gene> prevlayer = new ArrayList<>();
    while (ok) {
      ArrayList<Gene> layer = new ArrayList<>();
      for (Gene g : d.genes) {
        if (g.depth == iter) layer.add(g);
      }
      if (layer.size() > 0) {
        for (int i = 0; i < layer.size(); i++) {
          if (iter > 1) {
            ArrayList<Integer> paradr = new ArrayList<>(layer.get(i).adress);
            paradr.remove(paradr.size() - 1);
            int parent = -10;

            for (int j = 0; j < prevlayer.size(); j++) {
              if (paradr.equals(prevlayer.get(j).adress)) parent = j;
            }

            canvas.stroke(255);
            canvas.strokeWeight(1);
            canvas.line(
                canvas.width / 2f + (nxsize + xmar) * parent - ((nxsize + xmar) * prevlayer.size()) / 2f, (nysize + ymar) * (iter - 1) + nysize / 2f,
                canvas.width / 2f + ((nxsize + xmar) * (i)) - ((nxsize + xmar) * layer.size()) / 2f, (nysize + ymar) * iter - nysize / 2f);
          }
          canvas.noStroke();

          drawNode(layer.get(i).type, canvas.width / 2f + ((nxsize + xmar) * (i)) - ((nxsize + xmar) * layer.size()) / 2f, (nysize + ymar) * iter);
        }
      } else {
        ok = false;
      }
      iter++;
      prevlayer = layer;
    }

    canvas.endDraw();
  }

  void drawNode(String type, float x_, float y_) {
    canvas.noFill();
    canvas.stroke(250);
    canvas.fill(255);
    canvas.text(type.toUpperCase(), x_, y_);
  }
}

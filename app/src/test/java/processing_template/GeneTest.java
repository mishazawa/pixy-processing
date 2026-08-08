package processing_template;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GeneTest {

  @Test void valueTypesHaveNoChildNodes() {
    DNA dna = new DNA(new Pixi());
    dna.genes = new java.util.ArrayList<>();
    assertEquals(0, new Gene(dna, "x").nodes);
    assertEquals(0, new Gene(dna, "y").nodes);
  }

  @Test void binaryOperatorsHaveTwoChildNodes() {
    DNA dna = new DNA(new Pixi());
    dna.genes = new java.util.ArrayList<>();
    assertEquals(2, new Gene(dna, "add").nodes);
    assertEquals(2, new Gene(dna, "sub").nodes);
    assertEquals(2, new Gene(dna, "mult").nodes);
    assertEquals(2, new Gene(dna, "div").nodes);
  }

  @Test void ifNodeHasFourChildren() {
    DNA dna = new DNA(new Pixi());
    dna.genes = new java.util.ArrayList<>();
    assertEquals(4, new Gene(dna, "if").nodes);
  }

  @Test void randomValueGenesBindAnArgSlot() {
    DNA dna = new DNA(new Pixi());
    dna.genes = new java.util.ArrayList<>();
    dna.args = new java.util.ArrayList<>();

    Gene g = new Gene(dna, "rndm");

    assertEquals(0, g.argsBinder);
    assertEquals(1, dna.args.size());
    assertEquals("g_arg(0)", g.get());
  }

  @Test void copyPreservesTypeAndAddress() {
    DNA dna = new DNA(new Pixi());
    dna.genes = new java.util.ArrayList<>();
    Gene original = new Gene(dna, "sin");
    original.setAdress(new java.util.ArrayList<>(java.util.List.of(0, 1)));

    Gene copy = original.copy(dna);

    assertEquals(original.type, copy.type);
    assertEquals(original.adress, copy.adress);
    assertEquals(original.depth, copy.depth);
  }
}

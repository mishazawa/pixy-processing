package processing_template;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DNATest {

  @Test void randomDnaProducesConstructedCode() {
    DNA dna = new DNA(new Pixi(), "RANDOM");

    assertNotNull(dna.genes);
    assertFalse(dna.genes.isEmpty());
    assertNotNull(dna.code);
    assertTrue(dna.code.startsWith("vec3 col ="));
  }

  @Test void copyProducesIndependentGeneList() {
    DNA original = new DNA(new Pixi(), "RANDOM");

    DNA copy = original.copy();

    assertEquals(original.code, copy.code);
    assertEquals(original.genes.size(), copy.genes.size());
    assertNotSame(original.genes, copy.genes);
  }

  @Test void mutateKeepsCodeValid() {
    DNA dna = new DNA(new Pixi(), "RANDOM");

    dna.mutate();

    assertNotNull(dna.code);
    assertTrue(dna.code.startsWith("vec3 col ="));
    assertFalse(dna.genes.isEmpty());
  }

  @Test void sexProducesChildWithConstructedCode() {
    Pixi app = new Pixi();
    DNA parent1 = new DNA(app, "RANDOM");
    DNA parent2 = new DNA(app, "RANDOM");

    DNA child = parent1.sex(parent1, parent2);

    assertNotNull(child.code);
    assertTrue(child.code.startsWith("vec3 col ="));
    assertFalse(child.genes.isEmpty());
  }
}

// function_tree.js
class node 
{ // CONSTRUCTOR
  constructor()
  { this.value = null;
    this.parent = null;
    this.first_child = null;
    this.next_neighbor = null;
    this.prev_neighbor = null;
    this.is_operator = false;
    this.has_been_closed = false;
  }

  create_first_child(first_child_value)
  { let new_first_child = new node();
    new_first_child.parent = this;
    new_first_child.value = first_child_value;
    this.first_child = new_first_child;
    console.log("Creating first child (" + this.first_child.value + ") of parent (" + this.value + ")");
  }
  
  create_next_neighbor(next_neighbor_value)
  { let new_next_neighbor = new node();
    new_next_neighbor.prev_neighbor = this;
    if (this.parent !== null)
    { new_next_neighbor.parent = this.parent;
    }
    new_next_neighbor.value = next_neighbor_value;
    this.next_neighbor = new_next_neighbor;
    console.log("Creating next neighbor (" + this.next_neighbor.value + ") of prev neighbor (" + this.value +
      ")");
  }
} // end of node class definition

// in parser.js this.entry_types.FUNCTION_TREE is equal to a constant of 0.
// this is important knowledge for the deep copy method.
const FUNCTION_TREE = 0; 

class function_tree
{ // CONSTRUCTOR
  constructor(operator)
  { // the root node is always constructed with the value of the root operator.
    this.root_node = new node(); 
    this.root_node.value = operator; // root_node should never again be altered in the code.
    this.root_node.is_operator = true;
    this.current_node = this.root_node;
  }

  move_to_first_child()
  { if (this.current_node.first_child)
    { this.current_node = this.current_node.first_child;
    }
  }
  
  move_to_next_neighbor()
  { if (this.current_node.next_neighbor)
    { this.current_node = this.current_node.next_neighbor;
    }
  }

  move_to_parent()
  { if (this.current_node.parent)
    { this.current_node = this.current_node.parent;
    }
  }

  move_to_prev_neighbor()
  { if (this.current_node.prev_neighbor)
    { this.current_node = this.current_node.prev_neighbor;
    }
  }

  // calling this method resets the position of the current node to the root position.
  // thus, this method should only be called when there is no need to record additional
  // information into the calling object. in other words, use this function only when
  // pushing the finished outer class object to some new place, after which outer class 
  // object should be reset using its default constructor.
  // **returns**: function_tree object
  create_deep_copy()
  { const new_tree = new function_tree(this.root_node.value)
    new_tree.type = FUNCTION_TREE;
    this.current_node = this.root_node;
    // root node has no first child? return the single node as the new tree.
    if (this.root_node.first_child === null)
    { return new_tree;
    }
    // handle first child of root node
    else
    { // create new first child node for the root of the new tree.
      new_tree.root_node.create_first_child(this.root_node.first_child.value);
      // move new_tree's current node (root) to the newly assigned first child position.
      new_tree.move_to_first_child();
      // move the class's current node equivalently.
      this.move_to_first_child();
      if (this.current_node.is_operator)
      { new_tree.current_node.is_operator = true;
      }
    }
    // the algorithm below will always return the current node to root. 
    while (this.current_node !== this.root_node)
    { // always barrel down as far as possible before looking for neighbors.
      while (this.current_node.first_child !== null)
      { // create new first child node for new tree.
        new_tree.current_node.create_first_child(this.current_node.first_child.value);
        new_tree.move_to_first_child();
        this.move_to_first_child();
        if (this.current_node.is_operator)
        { new_tree.current_node.is_operator = true;
        }
      } 
      // once you are at the bottom, can you find a next neighbor?
      if (this.current_node.next_neighbor !== null)
      { // create next neighbor node for new tree.
        new_tree.current_node.create_next_neighbor(this.current_node.next_neighbor.value);
        new_tree.move_to_next_neighbor();
        this.move_to_next_neighbor();
        if (this.current_node.is_operator)
        { new_tree.current_node.is_operator = true;
        }
      }
      // otherwise,
      else 
      {// console.log("Does neighbor of (" + this.current_node.value + ") exist: " + (this.current_node.next_neighbor !== null));
        //console.log("Does parent of (" + this.current_node.value + ") exist: " + (this.current_node.parent_node.value));
        // go up the parents until there is a new neighbor or you return to root.
        while (this.current_node.parent !== null && this.current_node.next_neighbor === null)
        { this.move_to_parent();
          new_tree.move_to_parent();
        }
        // made it back to root? return the new tree.
        if (this.current_node === this.root_node)
        { console.log("deep copy is returning");
          return new_tree;
        }
        // found a next neighbor? copy and move to it.
        else if (this.current_node.next_neighbor !== null)
        { new_tree.current_node.create_next_neighbor(this.current_node.next_neighbor.value);
          new_tree.move_to_next_neighbor();
          this.move_to_next_neighbor();
          if (this.current_node.is_operator)
          { new_tree.current_node.is_operator = true;
          }
        }
      }
    }
    console.log("deep copy is returning");
    return new_tree;
  } // end of create_deep_copy()
}
